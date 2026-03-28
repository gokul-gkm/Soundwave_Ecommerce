const adminRoute=(req,res,next)=>{
    try{
       if(!req.session.admin){
        return res.redirect('/')
       }
       next();
    }catch(err){
        console.log(err.message+' admin middleware')
    }
}
module.exports={
    adminRoute
}