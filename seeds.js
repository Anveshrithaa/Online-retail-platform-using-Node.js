var mongoose = require("mongoose");
var Cycle = require("./models/cycle");
var Comment   = require("./models/comment");

var data = [
    {
        brand: "Ladybird", 
        model: "Splash123",
        date: "20.10.2016",
        city: "Chennai",
        state: "Tamil nadu",
        phone: "9876543210",
        mail: "anu@yahoo.com",
        war: "No",
        descrip: "Good condition, pink color girls/women's cycle, adjustable seat height",
        image: "https://apollo-singapore.akamaized.net/v1/files/rccw5gnrsdug1-IN/image;s=850x0",
        
    },
    {
        brand: "Hercules", 
        model: "Electro",
        date: "02.01.2015",
        city: "Coimbatore",
        state: "Tamil nadu",
        phone: "9876543406",
        mail: "anveshritha@gmail.com",
        war: "Till 20.10.2019",
        descrip: "Good condition, green with black color, boys cycle, Gear type, 37 inch frame size, adjustable seat height",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8xDyOfO1tpOV5zPmRZTGCl752joSFNWrtgmx9YF-TKZhRDr-V"
        
        
    },
    {
        brand: "Hero", 
        model: "Spark",
        date: "02.04.2014",
        city: "Coimbatore",
        state: "Tamil nadu",
        phone: "9876543465",
        mail: "anitha@gmail.com",
        war: "Till 05.10.2020",
        descrip: "Good condition, white with black color, boys cycle, not Gear type, 29 inch frame size, adjustable seat height",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnm-eWyXug0pnSZOhc2i8oVa1gg4sGvspofmCo3TKP4INj4fOLnA",
        
    },
]

function seedDB(){
   //Remove all cycles
   Cycle.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log(".");
         //add a few cycles
        data.forEach(function(seed){
            Cycle.create(seed, function(err, cycles){
                if(err){
                    console.log(err)
                } else {
                    console.log(".");
                    //create a comment
                    Comment.create(
                        {
                            text: "Is it in good condition?",
                            author: "Harish"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                cycles.comments.push(comment);
                                cycles.save();
                                console.log(".");
                            }
                        });
                }
            });
        });
    }); 
    //add a few comments
}

module.exports = seedDB;
