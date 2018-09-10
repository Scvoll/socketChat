import React from 'react'
import ReactDOM from 'react-dom'
import socket from 'socket.io-client'
import style from './styles/style.scss'
import { Chat } from './chat'
export const io = socket("http://localhost:3000");

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogIn: true,  //change tabs between logIn window and chat window
            selfId: '',
            nickName: '',
            errorText: ''
        };
        this.inputRef = React.createRef();
    }

    componentDidMount() {
        this.inputRef.current.focus();
    }

    handleChange (e) {
        this.setState({
            errorText: '',
            nickName: e.target.value
        })
    }

    handleSubmit (e) {
        e.preventDefault();
        io.emit('nickName', this.state.nickName);

        io.on('id', function (data) {
           this.setState({selfId: data})
        }.bind(this));

        io.on('userInChat', function (data) {
            if (data.inChat) {
                this.setState({errorText: "Person with same nickname is in chat already"})
            } else {
                this.setState({isLogIn: false});
            }
        }.bind(this));
    }

    render() {
        if (this.state.isLogIn) {
            return (
                <div className={'fullLoginForm'}>
                    <div className={'logFormTop'}>
                        <h1>Public Chat</h1>
                        <div className={'icon'}>
                            <div className={'lineIconOne'}/>
                            <div className={'lineIconTwo'}/>
                            <div className={'iconTriangle'}/>
                        </div>
                        <form onSubmit={this.handleSubmit.bind(this)}>
                            <label>
                                <span>Nickname</span>
                                <input type='text'
                                       value={this.state.nickName}
                                       onChange={this.handleChange.bind(this)}
                                       maxLength={15}
                                       ref={this.inputRef}/>
                            </label>
                            <div className={'line'}/>
                            <button type='submit'
                            disabled={!this.state.nickName}>Go in!</button>
                            <h2>{this.state.errorText}</h2>
                        </form>

                    </div>
                    <div className={'logFormBottom'}/>
                </div>

            )
        } else {
            return <Chat nickName={this.state.nickName} selfId = {this.state.selfId}/>
        }

    }
}


ReactDOM.render(
    <App/>,
    document.getElementById('root')
);