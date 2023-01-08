import {useEffect, useState} from "react";
import {io} from "socket.io-client";
import {useLocation, useNavigate} from "react-router-dom";

import emoji from '../assets/images/emoji.svg'
import styles from '../styles/Chat.module.css';
import EmojiPicker from "emoji-picker-react";
import Messages from "./Messages";

const IO = io.connect('http://localhost:5000');

const Chat = () => {
    const [state, setState] = useState([]);
    const {search} = useLocation();
    const navigate = useNavigate();
    const [params, setParams] = useState({room: '', user: ''});
    const [message, setMessage] = useState('');
    const [emojiesIsOpen, setEmojiesIsOpen] = useState(false);
    const [users, setUsers] = useState(0);

    useEffect(() => {
        const searchParams = Object.fromEntries(new URLSearchParams(search));
        setParams(searchParams);
        IO.emit('join', searchParams);
    }, [search]);

    useEffect(() => {
        IO.on('message', ({data}) => {
            setState((state) => ([...state, data]))
        });
    }, []);

    useEffect(() => {
        IO.on('joinRoom', ({data: {users}}) => {
            setUsers(users.length);
        });
    }, []);

    const leftRoomHandler = () => {
        IO.emit('leftRoom', {params});
        navigate('/');
    };

    const messageChangeHandler = ({target: {value}}) => setMessage(value);

    const onEmojiClick = ({emoji}) => setMessage(`${message} ${emoji}`);

    const sendMessageHandler = (e) => {
        e.preventDefault();

        if (!message) return;

        IO.emit('sendMessage', {message, params});

        setMessage('');
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.header}>
                <div className={styles.title}>{params.room}</div>
                <div className={styles.users}>{users} users in this room</div>
                <button className={styles.left} onClick={leftRoomHandler}>Left</button>
            </div>
            <div className={styles.messages}>
                <Messages messages={state} name={params.name}/>
            </div>
            <form className={styles.form} onSubmit={sendMessageHandler}>
                <div className={styles.input}>
                    <input
                        type="text"
                        name='message'
                        placeholder='What do you want to say?'
                        value={message}
                        onChange={messageChangeHandler}
                        autoComplete='off'
                        required
                    />
                </div>
                <div className={styles.emoji}>
                    <img src={emoji} alt="emojies" onClick={() => setEmojiesIsOpen(!emojiesIsOpen)}/>
                    {emojiesIsOpen && (
                        <div className={styles.emojies}>
                            <EmojiPicker onEmojiClick={onEmojiClick}/>
                        </div>
                    )}
                </div>

                <div className={styles.button}>
                    <input type="submit" value='Send a message' onSubmit={sendMessageHandler}/>
                </div>
            </form>
        </div>
    );
};

export default Chat;