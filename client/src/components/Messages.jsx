import styles from '../styles/Messages.module.css';

const Messages = ({messages, name}) => {
    return (
        <div className={styles.messages}>
            {messages.map(({user, message}, index) => {
                const currentUser = user.name.trim().toLowerCase() === name.trim().toLowerCase();
                const className = currentUser ? styles.me : styles.user;
                return (
                    <div key={index} className={`${styles.message} ${className}`}>
                        <span className={styles.user}>{user.name}</span>
                        <div className={styles.text}>{message}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default Messages;