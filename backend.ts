const express = require('express')
, async = require('async')
, http = require('http')
, mysql = require('mysql')
const app = express()
const port = 3000

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'u447090379_user1',
  password: "pompet-tYnfig-3qahgo",
  database: 'u447090379_db1'
});

connection.connect(); 

let startTime = Date.now()

let duration = 1188.8848979591837 * 1000 //ms durata

let tracksUrl = '';
let trackQuery = 'SELECT * FROM `Tracks`';

let tracks:Track[] = []

function getCurrentTime():number {
  let d = Date.now() - startTime
  if(d > duration) {
    loopBackTime()
    return d -= duration
  }
  return  d;
}

async function loopBackTime() {
  return new Promise((succ, err)=>{
    startTime = startTime + duration
    succ(1)
  })
}


app.get('/', (req, res) => {
  res.render('public/index.html')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/start', (req, res)=>{
  startTime = Date.now()
  res.send(JSON.stringify(1))
})

app.get('/time', (req, res)=>{
  res.send(JSON.stringify(getCurrentTime()))
})

app.get('/track', (req, res)=>{
  res.send(JSON.stringify(getTrack()))
})

app.get('/all_tracks', (req, res)=>{
  res.send(JSON.stringify(tracks))
})


function setupTracks(){
  connection.query(trackQuery, function(err, rows, fields) {
    console.log('Connection result error '+err);
    tracks = rows;

});
}

function getTrack() {
  let t = tracks[0];
  tracks[0].istances++
  return t
}

interface Track {
  id: number,
  title: string,
  src: string,
  istances: number,
  volume: number,
  delay: number
}

