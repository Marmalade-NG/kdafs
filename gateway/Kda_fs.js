import _ from 'lodash/fp.js';
import {createClient, Pact,} from '@kadena/client'

const NODES = {testnet04:"https://api.testnet.chainweb.com",
               mainnet01:"https://api.chainweb.com"}

const CHAINS = _.map(_.toString,_.range(0, 20))

const split_path = _.flow([_.trimCharsStart("/"), _.split("/")])

const handle_pact_resp = (resp) => { if(resp?.result?.status !== 'success')
                                      throw Error(`Pact failure: ${resp?.result?.error?.message}`)
                                     else
                                      return resp.result.data;}


function kda_fs_retrieve(host, _module, cid)
{
  const [network, chain] = _.split(":")(host);

  if (!network || !chain || !_module || !cid)
    throw new Error("Invalid kdafs: URL");

  const node = NODES[network]

  if (!node)
    throw new Error("Invalid network")

  if (!CHAINS.includes(chain))
    throw new Error("Invalid chain")

  const client = createClient(`${node}/chainweb/0.0/${network}/chain/${chain}/pact`);

  const cmd = Pact.builder
                  .execution(`{'imm:(${_module}.kdafs-immutable),'data:(${_module}.kdafs-get "${cid}")}`)
                  .setMeta({chainId:chain, gasLimit:150000})
                  .setNetworkId(network)
                  .createTransaction();

  return client.dirtyRead(cmd)
         .then(handle_pact_resp)
         .then(_.update("data",_.mapValues(from_pact_val)))
}

const kda_fs_retrieve_data = (h, m, c) => kda_fs_retrieve(host, _module, cid)
                                          .then(_.get("data"))


const KDAFS_REGEXP = /^kdafs:\/\/(.+:\d+)\/(.+)\/(.+)$/

function kda_fs_from_url(url)
{
  const match = url.match(KDAFS_REGEXP)
  if(!match)
    throw new Error("Invalid kdafs URL");

  return kda_fs_retrieve(match[1], match[2], match[3])
}

const kda_fs_from_url_data = u => kda_fs_from_url(u)
                                  .then(_.get("data"))


/* Pact values conversions */
const is_pact_int = _.compose(_.isEqual(['int']), _.keys)
const is_pact_decimal = _.compose(_.isEqual(['decimal']), _.keys)

const from_pact_val = x => _.cond([[is_pact_int,     _.get('int')],
                                   [is_pact_decimal, _.get('decimal')],
                                   [_.isPlainObject, _.mapValues(from_pact_val)],
                                   [_.isArray,       _.map(from_pact_val)],
                                   [_.T,             _.identity]])(x)



export {kda_fs_from_url, kda_fs_from_url_data, kda_fs_retrieve, kda_fs_retrieve_data}
