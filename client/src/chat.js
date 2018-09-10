import { io } from './index'
import React from 'react'

export class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.lastMessage = React.createRef();
        this.state = {
            messages: [],
            selfText: '',
            online: []
        }
    }

    componentDidMount () {

        io.on('sendAllMessagesAndOnline', function (data) {
            this.setState({messages: data.messages,
                online: data.isOnline});
            setTimeout(()=> this.lastMessage.current.scrollIntoView(),0);
        }.bind(this));

        io.on('newMessageToPeople', function (data) {
            this.setState((prevState) => (
                {messages: prevState.messages.concat(data)}
            ));
            setTimeout(()=> this.lastMessage.current.scrollIntoView(),0)
        }.bind(this));

        io.on('userConnect', function (user) {
            this.setState((prevState) => (
                {online: prevState.online.concat(user)}
            ))
        }.bind(this));

        io.on('userDisconnect',function (id) {
            let newOnline = this.state.online.filter((item) => item.id !== id);
            console.log(newOnline);
            this.setState({online: newOnline});
        }.bind(this));



    }

    sendMessage (e) {
        e.preventDefault();
        let data = {nickName: this.props.nickName, message: this.state.selfText, selfId: this.props.selfId};
        this.setState((prevState) => (
            {
                messages: prevState.messages.concat({...data, createdAt: new Date().toLocaleString()}),
                selfText: ''
            }
        ));
        io.emit('sendMessage', data);
        setTimeout(()=> this.lastMessage.current.scrollIntoView(),0)
    }

    handleWriteText (e) {
        this.setState({selfText: e.target.value})
    }

    getUserFriendlyTime (state) {
        let time = new Date(state);
        return time.toLocaleString();
    }

    render() {
        return (
            <div className={'chatWindow'}>
                <div className={'online'}>
                    <span>Online</span>
                    <ul>
                        {
                            this.state.online.map((user) => (
                                <li key={user.id}>{user.nickName}</li>
                            ))
                        }
                    </ul>
                </div>
                <div className={'messageWindow'}>
                    <div className={'messages'}>
                        {this.state.messages.map((data, key) => {
                            return (
                                <div key={key} className={
                                    this.props.nickName === data.nickName
                                    ? "selfMessage"
                                    :"friendMessage"}>
                                    <span className={'nick'}>{
                                        this.props.nickName === data.nickName
                                            ? 'you' : data.nickName}
                                            :</span><br/>
                                    <span className={'text'}>{data.message}</span><br/>
                                    <span className={'date'}>{this.getUserFriendlyTime(data.createdAt)}</span>
                                </div>
                            )
                        })}
                        <div className={'emptySpace'} ref={this.lastMessage}/>
                    </div>
                    <form onSubmit={this.sendMessage.bind(this)}>
                        <input value={this.state.selfText}
                               placeholder={"Type message..."}
                               onChange={this.handleWriteText.bind(this)}/>
                        <button type='submit'>Send</button>
                    </form>
                </div>
            </div>
        )
    }
}