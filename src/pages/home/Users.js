import { gql, useQuery } from '@apollo/client'
import React, {  } from 'react'
import { Col, Image} from 'react-bootstrap'
import { useMessageDispatch, useMessageState } from '../../context/message'
import classNames from 'classnames'

const GET_USERS = gql`
    query getUsers{
        getUsers{
            username
            email
            image_url
            created_at
            latestMessage{
                uuid,
                content,
                from,
                to,
                created_at
            }
            token
        }
    }
`;

export default function Users() {
    const dispatch = useMessageDispatch();
    const { users } = useMessageState()
    const selectedUser =  users?.find(u => u.selected ===  true)?.username;

    const {loading } =  useQuery(GET_USERS, {
        onCompleted: data => dispatch({type:'SET_USERS', payload:data.getUsers}),
        onError:err =>  err
    });

    let usersMarkup
    if(!users || loading){
        usersMarkup = <p>Loading....</p>
    }else if(users.length  === 0){
        usersMarkup = <p>No users hve joined yet</p>
    } else if(users.length  > 0){
        usersMarkup = users.map((user) => {
            const selected =  selectedUser === user.username
            return(
                <div role="button" className={classNames("user-div d-flex justify-content-center justify-content-md-start  p-3",{'bg-white':selected})} key={user.username} onClick={() => dispatch({type:'SET_SELECTED_USER',payload:user.username })}>
                    <Image  src={user.image_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} className="user-image "/>
                    <div className="d-none d-md-block ml-3">
                    <p className="text-success">{user.username}</p>
                        <p className="font-weight-lighter">{user.latestMessage ? user.latestMessage.content : "You are now connected"}</p>
                    </div>
                </div>
            )
        })
    }

    return (
         <Col xs={2} md={4} className="p-0 bg-secondary">{usersMarkup}</Col>
    )
}
