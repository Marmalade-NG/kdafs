import {useCallback, useState} from 'react'
import _ from 'lodash/fp.js';
import 'semantic-ui-css/semantic.min.css'
import {Container, Dropdown, Form, Input, Image, Menu, Segment, Message, Header, Label, Icon} from 'semantic-ui-react'
import ReactJson from 'react-json-view'
import {kda_fs_from_url, kda_fs_retrieve} from './Kda_fs.js'

const retrieve_images = _.compose([_.filter(_.startsWith("data:image")),
                                   _.values])

const KdafsDataSegment = ({data}) =>  <Segment textAlign="left" stacked>
                                        <Label attached='top left'>Raw data</Label>
                                        <ReactJson src={data} name="/" theme="monokai" iconStyle="square" collapsed={1} collapseStringsAfterLength={32} />
                                      </Segment>

const KdafsImagesSegment = ({images}) =>  <Segment textAlign="left" stacked>
                                            <Label attached='top left'>Embeded images</Label>
                                            <Image.Group size='medium'>
                                              {images.map((x,i) => <Image src={x} key={i} as='a' href={x} target='_blank'/>)}
                                            </Image.Group>
                                          </Segment>

function KdafsSearch ()
{
  const [data, setData] = useState(null);
  const [error_msg, setError_msg] = useState(null)

  const images = retrieve_images(data);
  const hasImages = images && images.length !=0;

  const submit_fetch = useCallback(async (ev) =>  { const v = ev.target[0].value;
                                                    if(v)
                                                    {
                                                      try
                                                      {
                                                        setData(await kda_fs_from_url(v));
                                                        setError_msg(null);
                                                      }
                                                      catch(err)
                                                      {
                                                        setData(null);
                                                        setError_msg(err.message);
                                                      }
                                                    }
                                                    else
                                                    {
                                                      setData(null);
                                                      setError_msg(null);
                                                    }
                                                  })

  return  <Segment raised >
            <Header as="h1"> <Icon name='pin' /> Retrieve kdafs:// URL </Header>
            <Form onSubmit={submit_fetch} >
              <Input icon='linkify' iconPosition='left' action={{ icon: 'search' }} placeholder='kdafs://' fluid />
            </Form>
            {error_msg && <Message negative>
                            <Message.Header>Retrieval error</Message.Header>
                            <p>{error_msg}</p>
                          </Message>}
            {data && <KdafsDataSegment data={data} />}
            {hasImages && <KdafsImagesSegment images={images} />}
          </Segment>
}

const App = () => (
    <Container style={{padding:"15px"}}>
      <KdafsSearch />
    </Container>)

export default App
