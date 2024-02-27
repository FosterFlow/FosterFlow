//TODO: it renders 8 times, figure it out
import React, { useRef, useEffect, useState } from 'react';
import { 
    Spinner,
    Alert 
} from "reactstrap";
import { connect } from "react-redux";
import withRouter from "../../../components/withRouter";
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import config from '../../../config';
import MessagesList from "./MessagesList";
import { 
    fetchMessages,
    setSkipFetchMessages
} from "../../../redux/actions";


function ChatBody(props) {
    console.log ('Chats ChatBody component rendering');
    const [showMessagesList, setShowMessagesList] = useState(false);
    const {
        fetchMessagesLoading,
        fetchMessagesErrors,
        fetchMessagesSuccess, 
        activeChatId,
        authorizedUser,
        addChatRequestMessage,
        fetchMessages,
        skipMessagesFetching,
        setSkipFetchMessages
    } = props;
    const { t } = useTranslation();
    //TODO: review if it's neccesary to store all messages into store
    const supportEmail =  config.SUPPORT_EMAIL;

    useEffect(() => {
        if (fetchMessagesSuccess === true) {
            setShowMessagesList(true);
        }

        if (fetchMessagesLoading === true) {
            setShowMessagesList(false);
        }

    }, [fetchMessagesSuccess, fetchMessagesLoading]);

    function isChatDisabled(){
        return activeChatId === 0 ||
        authorizedUser === null ||
        authorizedUser.is_email_confirmed === false ||
        addChatRequestMessage !== undefined;
    }

    useEffect(() => {
        if (isChatDisabled()) { 
            return; 
        }

        if (skipMessagesFetching) {
          setSkipFetchMessages(false);
          return;
        }

        fetchMessages(activeChatId);
    }, [activeChatId, authorizedUser]);

    return (
        <React.Fragment>
            <div className="user-chat-conversation">
            {  fetchMessagesLoading &&
                <div className="d-flex justify-content-center">
                    <Spinner size="sm"/>
                </div>
            }
            { fetchMessagesErrors && (
                <Alert color="danger">
                    {t('Errors details')}:
                        <ul>
                        {fetchMessagesErrors.details.map((error, index) => (
                            <li key={index}>{error}</li>
                                ))}
                        </ul>
                        <hr/>
                        {t("If you do not know what to do with the error, write to us by mail")}: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
                    </Alert>
                )}
            { showMessagesList &&
                <MessagesList/>
            }
            </div>
        </React.Fragment>
    );
}


const mapStateToProps = (state) => {
    const {
        activeChatId,
        activeChat,
    } = state.Chat;

    const {
        fetchMessagesLoading,
        fetchMessagesErrors,
        fetchMessagesSuccess,
        addChatRequestMessage,
        skipMessagesFetching
    } = state.Message;

    return {
        fetchMessagesLoading,
        fetchMessagesErrors,
        fetchMessagesSuccess,
        activeChatId,
        activeChat,
        addChatRequestMessage,
        skipMessagesFetching,
        authorizedUser: state.User.authorizedUser,
        userAgent: state.Agents.userAgent,
    }
};

const mapDispatchToProps = {
    fetchMessages,
    setSkipFetchMessages
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChatBody));