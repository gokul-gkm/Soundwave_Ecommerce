const adminRoute=(req,res,next)=>{
    try{
       if(!req.session.admin){
        return res.redirect('/')
       }
       next();
    }catch(err){

    }
}
module.exports={
    adminRoute
}