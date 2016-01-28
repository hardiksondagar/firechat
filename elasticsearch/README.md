ElasticSearch
==========

A pluggable integration with ElasticSearch to provide advanced content searches in Firebase.

This script can:
 - monitor multiple Firebase paths and index data in real time
 - communicates with client completely via Firebase (client pushes search terms to `search/request` and reads results from `search/result`)
 - clean up old, outdated requests

Getting Started
===============

 - Install and run [ElasticSearch](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-14-04) or add [Bonsai service](https://addons.heroku.com/bonsai#starter) via Heroku
 - `npm install`
 - edit config.js (see comments at the top, you must set FB_URL at a minimum)
 - `node app.js` (run the app)

If you experience errors like `{"error":"IndexMissingException[[firebase] missing]","status":404}`, you may need
to manually create the index referenced in each path:

    curl -X POST http://localhost:9200/firebase

Run as Unix Service
===============
  - edit tipntrip-elastic.conf with the correct path of app.js
  - `cp tipntrip-elastic.conf /etc/init/`
  - `service tipntrip-elastic start`
  - check log file `tail -f /var/log/tipntrip-elastic.log` to monitor

Check out [this great tutorial](http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html) on querying ElasticSearch. And be sure to read the [ElasticSearch API Reference](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/).


Support [FLASHLIGHT]
=======

Submit questions or bugs using the [issue tracker](https://github.com/firebase/flashlight).

For Firebase-releated questions, try the [mailing list](https://groups.google.com/forum/#!forum/firebase-talk).


