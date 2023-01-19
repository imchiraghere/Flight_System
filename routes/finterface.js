var express = require("express");
var router = express.Router();
var pool = require("./pool");
var upload = require("./multer");
var LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./security");

///////////////////-----------> Flight Interface <--------------\\\\\\\\\\\\\\\

router.get("/flightinterface", function (req, res) {
  var admin = JSON.parse(localStorage.getItem("ADMIN"));
  if (admin) {
    res.render("flightinterface", { message: "" });
  } else {
    res.render("adminlogin", { message: "" });
  }
});

///////////////////-----------> Display ALl Flight's <--------------\\\\\\\\\\\\\\\

router.get("/flightdisplay", function (req, res) {
  var admin = JSON.parse(localStorage.getItem("ADMIN"));
  if (!admin) {
    res.render("adminlogin", { message: "" });
  } else {
    pool.query(
      "select F.*, (select C.cityname from citys C where C.cityid=F.sourcecity) as source, (select C.cityname from citys C where C.cityid=F.destinationcity) as destination from flight_details F",
      function (error, result) {
        if (error) {
          console.log(error);
          res.render("flightdisplay", { data: [], message: "Server Error" });
        } else {
          res.render("flightdisplay", { data: result, message: "Successfull" });
        }
      }
    );
  }
});

////////////////// ---------> Search Flight By Id <------------\\\\\\\\\\\\\\

router.get("/searchbyid", function (req, res) {
  pool.query(
    "select F.*, (select C.cityname from citys C where C.cityid=F.sourcecity) as source, (select C.cityname from citys C where C.cityid=F.destinationcity) as destination from flight_details F where flightid=?",
    [req.query.fid],
    function (error, result) {
      if (error) {
        console.log(error);
        res.render("flightbyid", { data: [], message: "Server Error" });
      } else {
        res.render("flightbyid", { data: result[0], message: "Successfull" });
      }
    }
  );
});

///////////////////-----------> Flight Data Submittt <--------------\\\\\\\\\\\\\\\

router.post("/flightsubmit", upload.single("logo"), function (req, res) {
  // console.log("Days", req.query.days);
  var days = ("" + req.body.days).replaceAll("'", '"');
  //   console.log("Data", req.body);
  //   console.log("File", req.file);
  pool.query(
    "insert into flight_details (flightname, flighttype, totalseats, days, sourcecity, arrvialtime, departuretime, destinationcity, company, logo)values(?,?,?,?,?,?,?,?,?,?)",
    [
      req.body.flightname,
      req.body.flighttype,
      req.body.totalseats,
      days,
      req.body.sourcecity,
      req.body.arrvialtime,
      req.body.departuretime,
      req.body.destinationcity,
      req.body.company,
      req.file.originalname,
    ],
    function (error, result) {
      if (error) {
        console.log(error);
        res.render("flightinterface", { message: "Server Error" });
      } else {
        res.render("flightinterface", {
          message: "Record Submitted Successfully!!",
        });
      }
    }
  );
});

///////////////////-----------> Flight Modification (Edit / Delete) <--------------\\\\\\\\\\\\\\\

router.post("/flight_edit_del", upload.single("logo"), function (req, res) {
  if (req.body.btn == "Edit") {
    var days = ("" + req.body.days).replaceAll("'", '"');
    pool.query(
      "update flight_details set flightname=?, flighttype=?, totalseats=?, days=?, sourcecity=?, arrvialtime=?, departuretime=?, destinationcity=?, company=? where flightid=?",
      [
        req.body.flightname,
        req.body.flighttype,
        req.body.totalseats,
        days,
        req.body.sourcecity,
        req.body.arrvialtime,
        req.body.departuretime,
        req.body.destinationcity,
        req.body.company,
        req.body.flightid,
      ],
      function (error, result) {
        if (error) {
          console.log(error);
          res.redirect("/flight/flightdisplay");
        } else {
          res.redirect("/flight/flightdisplay");
        }
      }
    );
  } else {
    pool.query(
      "delete from flight_details where flightid=?",
      [req.body.flightid],
      function (error, result) {
        if (error) {
          console.log(error);
          res.redirect("/flight/flightdisplay");
        } else {
          res.redirect("/flight/flightdisplay");
        }
      }
    );
  }
});

///////////////////-----------> Flight Logo Modification (Upload New) <--------------\\\\\\\\\\\\\\\

router.post("/editlogo", upload.single("logo"), function (req, res) {
  pool.query(
    "update flight_details set logo=? where flightid=?",
    [req.file.originalname, req.body.flightid],
    function (error, result) {
      if (error) {
        console.log(error);
        res.redirect("/flight/flightdisplay");
      } else {
        res.redirect("/flight/flightdisplay");
      }
    }
  );
});

////////////////// ---------> Search Flight By Id  For Logo <------------\\\\\\\\\\\\\\

router.get("/searchbyidlogo", function (req, res) {
  pool.query(
    "select F.*, (select C.cityname from citys C where C.cityid=F.sourcecity) as source, (select C.cityname from citys C where C.cityid=F.destinationcity) as destination from flight_details F where flightid=?",
    [req.query.fid],
    function (error, result) {
      if (error) {
        console.log(error);
        res.render("showimage", { data: [], message: "Server Error" });
      } else {
        res.render("showimage", { data: result[0], message: "Successfull" });
      }
    }
  );
});

///////////////////-----------> Fetch City By DB   <--------------\\\\\\\\\\\\\\\

router.get("/fetchallcity", function (req, res) {
  pool.query("select * from citys", function (error, result) {
    if (error) {
      res.status(500).json({ result: [], message: "Server Error" });
    } else {
      res.status(200).json({ result: result, message: "Success" });
    }
  });
});

module.exports = router;
