/* eslint react-native/no-inline-styles: 0 */

import PropTypes from 'prop-types';
import React from 'react';
import { View, ViewPropTypes, StyleSheet } from 'react-native';

import Avatar from './Avatar';
import Bubble from './Bubble';
import SystemMessage from './SystemMessage';
import Day from './Day';
import Time from './Time';

import { isSameUser, isSameDay } from './utils';

const styles = {
  left: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      marginLeft: 8,
      marginRight: 0,
    },
  }),
  right: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginLeft: 0,
      marginRight: 8,
    },
  }),
};

export default class Message extends React.Component {

  state = {
    showTime: false
  }

  shouldComponentUpdate(nextProps) {
    if ((nextProps.selectedId == this.props.currentMessage._id) || (this.props.currentMessage._id == this.props.selectedId)) {
      return true
    }
    return false
  }

  getInnerComponentProps() {
    const { containerStyle, selectedId, ...props } = this.props;
    return {
      ...props,
      isSameUser,
      isSameDay,
      selectedId
    };
  }

  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const { containerStyle, wrapperStyle, ...timeProps } = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps} />;
    }
    return null;
  }

  renderDay() {
    if (this.props.currentMessage.createdAt) {
      const dayProps = this.getInnerComponentProps();
      if (this.props.renderDay) {
        return this.props.renderDay(dayProps);
      }
      return <Day {...dayProps} />;
    }
    return null;
  }

  renderBubble() {
    const { onBubblePress = (item) => { }, onVideoPress = (item) => { } } = this.props
    const bubbleProps = this.getInnerComponentProps();
    if (this.props.renderBubble) {
      return this.props.renderBubble(bubbleProps);
    }
    return <Bubble
      onPress={onBubblePress}
      onVideoPress={onVideoPress}
      {...bubbleProps} />;
  }

  renderSystemMessage() {
    const systemMessageProps = this.getInnerComponentProps();
    if (this.props.renderSystemMessage) {
      return this.props.renderSystemMessage(systemMessageProps);
    }
    return <SystemMessage {...systemMessageProps} />;
  }

  renderAvatar() {
    if (this.props.user._id === this.props.currentMessage.user._id && !this.props.showUserAvatar) {
      return null;
    }
    const avatarProps = this.getInnerComponentProps();
    const { currentMessage } = avatarProps;
    if (currentMessage.user.avatar === null) {
      return null;
    }
    return <Avatar {...avatarProps} />;
  }

  render() {
    const { currentMessage, nextMessage, previousMessage, inverted } = this.props
    const sameUser = isSameUser(currentMessage, nextMessage);
    return (
      <View>
        {this.renderDay()}
        {currentMessage.system ? (
          this.renderSystemMessage()
        ) : (
            <View>
              {this.props.selectedId === this.props.currentMessage._id &&
                isSameDay(currentMessage, inverted ? previousMessage : nextMessage) &&
                < View style={{ alignItems: 'center' }}>
                  {this.renderTime()}
                </View>
              }
              <View
                style={[
                  styles[this.props.position].container,
                  { marginBottom: sameUser ? 2 : 10 },
                  !this.props.inverted && { marginBottom: 2 },
                  this.props.containerStyle[this.props.position],
                ]}
              >
                {this.props.position === 'left' ? this.renderAvatar() : null}
                {this.renderBubble()}
                {this.props.position === 'right' ? this.renderAvatar() : null}
              </View>
            </View>
          )
        }
      </View>
    );
  }

}

Message.defaultProps = {
  renderAvatar: undefined,
  renderBubble: null,
  renderDay: null,
  renderSystemMessage: null,
  position: 'left',
  currentMessage: {},
  nextMessage: {},
  previousMessage: {},
  user: {},
  containerStyle: {},
  showUserAvatar: true,
  inverted: true,
};

Message.propTypes = {
  renderAvatar: PropTypes.func,
  showUserAvatar: PropTypes.bool,
  renderBubble: PropTypes.func,
  renderDay: PropTypes.func,
  renderSystemMessage: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  user: PropTypes.object,
  inverted: PropTypes.bool,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
};
