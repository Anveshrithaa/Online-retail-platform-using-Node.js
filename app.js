
var express= require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose= require("mongoose");
var passport= require("passport");
var LocalStrategy= require("passport-local");
var methodOverride = require("method-override");
var Cycle  = require("./models/cycle");
var Comment  = require("./models/comment");
var User= require("./models/user");
var seedDB = require("./seeds");

seedDB();
mongoose.connect("mongodb://localhost:27017/buy_cycle",{useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));





app.use(express.static(__dirname+"/public"))

//PASSPORT CONFIG
app.use(require("express-session")({
    secret:"secrets",
    resave: false,
    saveUnitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser= req.user;
    next();
});



app.get("/",function(req,res){
    res.render("landing");
});
app.get("/cycles/faq", function(req,res){
    res.render("faq");
});
app.get("/cycles/bonus", function(req,res){
    res.render("bonus");
});

app.get("/cycles/about", function(req,res){
    res.render("about");
});
app.get("/cycles/contact", function(req,res){
    res.render("contact");
});




app.get("/cycles", function(req,res){ //campgrounds-->cycles
    //Get all cycles from DB
    Cycle.find({},function(err, allCycles){
        if(err){
            console.log(err);
        } else{
           res.render("cycles",{cycles:allCycles, currentUser: req.user}); 
        }
    });
        
});



app.post("/cycles", function(req,res){
    var brand= req.body.brand;
    var model=req.body.model;
    var date=req.body.date;
    var city=req.body.city;
    var state=req.body.state;
    var phone=req.body.phone;
    var mail=req.body.mail;
    var war=req.body.war;
    var descrip=req.body.descrip;
    var image=req.body.image;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCycle= {brand:brand, model:model, date:date, city:city, state:state, phone:phone, mail:mail, war:war, descrip:descrip,image:image, author:author};
    //Create a new cycle and save to db
    Cycle.create(newCycle,function(err, newlyCreated){
        if(err){
            console.log(err);
        } else{
            res.redirect("/cycles");
        }
    });
    
    
});
//show new form
app.get("/cycles/new", isLoggedIn, function(req, res){
    res.render("new.ejs");
});


// remove from here



app.get("/cycles/:id", function(req,res){
    Cycle.findById(req.params.id).populate("comments").exec( function(err, foundCycle){
        if(err){
            console.log(err);
        } else{
            console.log(foundCycle);
            res.render("show", {cycles:foundCycle});
        }
    });
    
});


app.get("/show",function(req,res){
    res.render("show");
});


//edit cycles
app.get("/cycles/:id/edit", checkCycleOwnership, function(req,res){
    Cycle.findById(req.params.id, function(err, foundCycle){
        if(err){
            console.log(err);
        }
        res.render("edit", {cycle:foundCycle});
    });
     
});

app.put("/cycles/:id", checkCycleOwnership, function(req, res){
    Cycle.findByIdAndUpdate(req.params.id, req.body.cycles, function(err,updatedCycle){
        if(err){
            res.redirect("cycles");
        } else{
            res.redirect("/cycles/" + req.params.id);
        }
    });
});

//delete cycle
app.delete("/cycles/:id", checkCycleOwnership, function(req,res){
    Cycle.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/cycles");
        } else{
            res.redirect("/cycles");
        }
    });
});



app.get("/cycles/:id/comments/new", isLoggedIn,  function(req,res){
    Cycle.findById(req.params.id, function(err, cycle){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new",{cycles:cycle});
        }
    });
});

app.post("/cycles/:id/comments/", isLoggedIn, function(req, res){
    //lookup cycles using ID
    Cycle.findById(req.params.id, function(err, cycles){
        if(err){
            console.log(err);
            res.redirect("/cycles");
        } else{
            Comment.create(req.body.comment, function(err,comment){
                if(err){
                    console.log(err);
                } else{
                    //comment.author.id= req.user._id;
                    //comment.author.username= req.user.username;
                    comment.save;
                    cycles.comments.push(comment);
                    cycles.save();
                    res.redirect('/cycles/'+ cycles._id);
                }
            });
        }
    });
        
});

//comment edit
app.get("/cycles/:id/comments/:comment_id/edit", function(req,res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else{
            res.render("comments/edit", {cycles_id: req.params.id, comment: foundComment});
        }
    });
    
});

//comment update
app.put("/cycles/:id/comments/:comment_id", function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else{
            res.redirect("/cycles/" + req.params.id);
        }
    });
});

//delete comment
app.delete("/cycles/:id/comments/:comment_id", function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else{
            res.redirect("/cycles/" + req.params.id);
        }
    });
});

// to here after adding DB

app.get("/signup",function(req,res){
    res.render("signup");
});

app.post("/signup", function(req, res){
    var newUser= new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/cycles");
        });
    });
});

app.get("/login",function(req,res){
    
    res.render("login");
});

app.post("/login", passport.authenticate("local",
{successRedirect: "/cycles",
failureRedirect: "cycles/login"
    
}), function(req,res){
    
});

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/cycles");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


function checkCycleOwnership(req, res, next){
    if(req.isAuthenticated()){
    Cycle.findById(req.params.id, function(err, foundCycle){
        if(err){
            res.redirect("back");
        } else{
            if(foundCycle.author.id.equals(req.user._id)){
                next();
                //res.render("edit", {cycles:foundCycle});
            } else{
                res.redirect("back");
            }
            
        }
    });
    } else{
        res.redirect("back");
    }
    
}

function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else{
            if(foundComment.author.id.equals(req.user._id)){
                next();
                //res.render("edit", {cycles:foundCycle});
            } else{
                res.redirect("back");
            }
            
        }
    });
    } else{
        res.redirect("back");
    }
    
}


app.get("/:user_id", function(req, res) {
    User.findById(req.params.user_id, function(err, foundUser) {
        if(err) {
            //req.flash("error", "Something went wrong");
            return res.redirect("back");
        } else {
            // Find out the campgrounds (if any) that this user has created
            Cycle.find().where('author.id').equals(foundUser._id).exec(function(err, cycles) {
                if(err) {
                    req.flash("error", "Something went wrong");
                    return res.redirect("back");
                }
                res.render("profile", { user: foundUser, cycles: cycles});
            });
        }
    })
});



app.listen(process.env.PORT, process.env.IP, function(){
    console.log(" Server has started");
});