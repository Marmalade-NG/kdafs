import {kda_fs_from_url, kda_fs_retrieve} from './Kda_fs.js'
import {version} from './version.js'
import express from 'express';
import NodeCache from 'node-cache';

const PORT = process.env.PORT || 3000
const START_DATE = new Date()


var app = express()
var cache = new NodeCache({maxKeys:2000})

var last_request = {}

const ttl = is_immutable => is_immutable?86400*2:60

const msg_to_error_code = msg => {if(msg.startsWith("Pact failure"))
                                    return 404;
                                  else if(msg.startsWith("Invalid"))
                                    return 502;
                                  else
                                    return 500;}

function kda_fs_retrieve_cached(params)
{
  const cache_key = JSON.stringify(params);
  const cached_data = cache.get(cache_key);

  if(cached_data)
    return Promise.resolve(cached_data)
  last_request = params
  return kda_fs_retrieve(params.host, params.mod, params.cid)
         .then(({data, imm}) => {try {cache.set(cache_key, data, ttl(imm))} catch {}
                                 return data})
}

app.get('/status', (req, res) => {
  res.json({port:PORT,
            version:version,
            startup:START_DATE,
            last_request:last_request,
            cache:cache.getStats()})
})

app.get('/kdafs/:host/:mod/:cid', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try
  {
    await kda_fs_retrieve_cached(req.params)
          .then(data => res.json(data))
  }
  catch(err)
  {
    res.status(msg_to_error_code(err.message))
    res.send(err.message)
  }
})

app.listen(PORT)
