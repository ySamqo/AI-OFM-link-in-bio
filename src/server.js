require('dotenv').config();
const express=require('express'), helmet=require('helmet'), rateLimit=require('express-rate-limit'), session=require('express-session'), bcrypt=require('bcrypt');
const {openDatabase}=require('./db'), {requireAdmin,isValidDestination,isValidSlug}=require('./security'), {trackClick,getAnalytics}=require('./analytics'), {resolveLink}=require('./linkResolver'), views=require('./views');
function createApp(db=openDatabase()){
 const app=express(); if(process.env.TRUST_PROXY==='true') app.set('trust proxy',1);
 app.use(helmet({contentSecurityPolicy:{directives:{styleSrc:["'self'","'unsafe-inline'"]}}})); app.use(express.urlencoded({extended:false})); app.use(express.static('public'));
 app.use(session({secret:process.env.SESSION_SECRET||'development-only-secret',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:86400000}}));
 const loginLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-7',legacyHeaders:false});
 app.get('/',(q,s)=>s.redirect('/admin')); app.get('/health',(q,s)=>s.json({status:'ok'})); app.get('/login',(q,s)=>s.send(views.login('',process.env.PREVIEW_MODE==='true')));
 app.post('/login',loginLimiter,async(q,s)=>{const u=db.prepare('SELECT * FROM admin_users WHERE email=?').get((q.body.email||'').toLowerCase());if(!u||!await bcrypt.compare(q.body.password||'',u.password_hash))return s.status(401).send(views.login('Email or password was not recognized.',process.env.PREVIEW_MODE==='true'));q.session.adminId=u.id;s.redirect('/admin');});
 app.post('/logout',(q,s)=>q.session.destroy(()=>s.redirect('/login')));
 app.get('/go/:slug',rateLimit({windowMs:60000,limit:120}), (q,s)=>{const link=resolveLink(db,q.params.slug);if(!link||!link.is_active)return s.status(404).send('Link not found');trackClick(db,link,q);/* Future deeplink/browser-opening behavior can be selected before this redirect. */s.redirect(302,link.destination_url);});
 app.use('/admin',requireAdmin);
 app.get('/admin',(q,s)=>s.send(views.dashboard(db.prepare('SELECT s.*, COUNT(c.id) clicks FROM smart_links s LEFT JOIN click_events c ON c.smart_link_id=s.id GROUP BY s.id ORDER BY s.created_at DESC').all(),process.env.BASE_URL||`${q.protocol}://${q.get('host')}`)));
 app.get('/admin/links/new',(q,s)=>s.send(views.linkForm())); app.get('/admin/links/:id/edit',(q,s)=>{const l=db.prepare('SELECT * FROM smart_links WHERE id=?').get(q.params.id);return l?s.send(views.linkForm(l)):s.sendStatus(404)});
 const save=(q,s,id)=>{const v=q.body, link={...v,is_active:v.is_active?1:0};if(!v.title||!isValidSlug(v.slug)||!isValidDestination(v.destination_url))return s.status(400).send(views.linkForm({...link,id},'Use a title, a lowercase slug, and a valid http:// or https:// destination.'));try{id?db.prepare('UPDATE smart_links SET title=@title,slug=@slug,destination_url=@destination_url,source=@source,is_active=@is_active,updated_at=CURRENT_TIMESTAMP WHERE id=@id').run({...link,id}):db.prepare('INSERT INTO smart_links(title,slug,destination_url,source,is_active) VALUES(@title,@slug,@destination_url,@source,@is_active)').run(link);s.redirect('/admin')}catch{return s.status(400).send(views.linkForm({...link,id},'That slug is already in use.'))}};
 app.post('/admin/links',(q,s)=>save(q,s));app.post('/admin/links/:id',(q,s)=>save(q,s,q.params.id));
 app.post('/admin/links/:id/toggle',(q,s)=>{db.prepare('UPDATE smart_links SET is_active=NOT is_active,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(q.params.id);s.redirect('/admin')});
 app.post('/admin/links/:id/delete',(q,s)=>{db.prepare('DELETE FROM smart_links WHERE id=?').run(q.params.id);s.redirect('/admin')});
 app.get('/admin/analytics',(q,s)=>s.send(views.analytics(getAnalytics(db)))); return app;
}
if(require.main===module)createApp().listen(process.env.PORT||3000,()=>console.log(`Obsidian Links running at http://localhost:${process.env.PORT||3000}`));
module.exports={createApp};
