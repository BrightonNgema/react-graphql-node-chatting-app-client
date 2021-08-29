import React, { useEffect, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { Col, Form } from 'react-bootstrap'

import { useMessageDispatch, useMessageState } from '../../context/message'
import Message from './Message'


const SEND_MESSAGE = gql`
  mutation sendMessage($to:String!, $content:String!){
    sendMessage(to:$to, content:$content){
      uuid
      from
      to
      content
      created_at
    }
  }
`
const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      created_at
      reaction{
        content
        uuid
        message{
          uuid
        }
      }
    }
  }
`

export default function Messages() {
  const { users } = useMessageState()
  const dispatch = useMessageDispatch()
  const [content, setContent] = useState('')

  const selectedUser = users?.find((u) => u.selected === true)
  const messages = selectedUser?.messages

  const [
    getMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_MESSAGES)

  const [sendMessage] = useMutation(SEND_MESSAGE, {

    onError:err => err
  })

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } })
    }
  }, [selectedUser])

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: 'SET_USER_MESSAGES',
        payload: {
          username: selectedUser?.username,
          messages: messagesData?.getMessages,
        },
      })
    }
  }, [messagesData])


  const submitMessage = e => {
    e.preventDefault()
    if(content.trim() ==="" || !selectedUser) return;
    setContent('')
    //mutation for sednig message
    sendMessage({variables:{to:selectedUser.username, content}})
  }

  let selectedChatMarkup
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p className="info-text">Select a friend</p>
  } else if (messagesLoading) {
    selectedChatMarkup = <p className="info-text">Loading..</p>
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((message, index) => (
    <React.Fragment>
       <Message key={index} message={message} />
       {index === message.length - 1 && <div className="invisible"><hr className="m-0"/> </div>}
    </React.Fragment>
    ))
  } else if (messages.length === 0) {
    selectedChatMarkup = <p className="info-text">You are now connected! send your first message!</p>
  }
  return(
    <Col xs={10} md={8} classNmae="p-0">
      <div className="messages-box d-flex flex-column-reverse p-3">{selectedChatMarkup}</div>
      <div className="px-3 py-2">
        <Form  onSubmit={submitMessage}>
          <Form.Group className="d-flex align-items-center m-0">
              <Form.Control 
                type="text" 
                className="message-input rounded-pill bg-secondary p-4 border-0" 
                placeholder="Type a message..." 
                value={content}
                onChange={e => setContent(e.target.value)} 
              />
              <i className="fas fa-paper-plane fa-2x text-primary ml-2" onClick={submitMessage}></i>
          </Form.Group>
        </Form> 
      </div>
    </Col>
  )
}