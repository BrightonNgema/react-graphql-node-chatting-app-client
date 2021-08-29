import React, { useEffect } from 'react'
import { Row  ,Button} from 'react-bootstrap'
import { Link} from 'react-router-dom'
import { useAuthDispatch, useAuthState } from '../../context/auth'
import { useMessageDispatch } from '../../context/message'
import Users from './Users'
import Messages from './Messages'
import { useSubscription, gql } from '@apollo/client';
import jwtDecode from 'jwt-decode'

const NEW_MESSAGE = gql`
    subscription newMessage{
        newMessage{
            uuid
            from
            to
            content
            created_at
        }
    }
`

const NEW_REACTION = gql`
    subscription newReaction{
        newReaction{
            uuid
            message{
                uuid from to
            }
            content
            created_at
        }
    }
`

export default function Home() {
    const authDispatch = useAuthDispatch();
    const messageDispatch = useMessageDispatch();

    const { user } = useAuthState()
    const { data:messageData, error:messageError}  = useSubscription(NEW_MESSAGE)
    const { data:reactionData, error:reactionError}  = useSubscription(NEW_REACTION)
    // const [selectedUser, setSelectedUser] (null);
    
    const logout = () => {
        authDispatch({type:"LOGOUT"});
        window.location.href = "/login"
        // history.push("/login")
    }


    useEffect(() => {
        const token  = localStorage.getItem('token');
        if(token){
            const decodedToken = jwtDecode(token);
            const expiresAt = new Date(decodedToken.exp * 1000);
            if(new Date() > expiresAt){
                return logout()
            }
        } else if(!token){
            return logout()
        }
    })

    useEffect(() => {
        // if(messageError) console.log(messageError)
        if(messageData) {
            const message = messageData.newMessage
            const otherUser = user.username === message.to ? message.from : message.to
            messageDispatch({type:'ADD_MESSAGE', payload:{
                username:otherUser,
                message
            }})
        }
    },[messageError,messageData ])

    useEffect(() => {
        // if(reactionError) console.log(reactionError)
        if(reactionData) {
            const reaction = reactionData.newReaction
            const otherUser = user.username === reaction.message.to ? reaction.message.from : reaction.message.to
            messageDispatch({type:'ADD_REACTION', payload:{
                username:otherUser,
                reaction
            }})
        }
    },[reactionError,reactionData ])

    return (
        <>
        <Row className="bg-white justify-content-around mb-1">
            <Link  style={{width:200}} to="/login">
                <Button variant="link">
                    Login
                </Button>
            </Link>
            <Link  style={{width:200}} to="/register">
                <Button variant="link">
                    Register
                </Button>
            </Link>
            <Button style={{width:200}} variant="link" onClick={logout}>
                Logout
            </Button>
        </Row>
        <Row className="bg-white justify-content-around">
            <Users />
            <Messages/>
        </Row>
        </>
    )
}
