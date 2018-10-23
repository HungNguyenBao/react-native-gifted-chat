/* eslint no-use-before-define: ["error", { "variables": false }] */

import PropTypes from 'prop-types';
import React from 'react';
import { Text, Clipboard, StyleSheet, TouchableOpacity, View, ViewPropTypes, TouchableWithoutFeedback, Image } from 'react-native';
import Video from 'react-native-video';
import MessageText from './MessageText';
import MessageImage from './MessageImage';
import Time from './Time';
import Color from './Color';

import { isSameUser, isSameDay } from './utils';

export default class Bubble extends React.PureComponent {

  constructor(props) {
    super(props);
    this.onLongPress = this.onLongPress.bind(this);
  }

  state = {
    paused: true
  }

  onLongPress() {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage);
    } else if (this.props.currentMessage.text) {
      const options = ['Copy Text', 'Cancel'];
      const cancelButtonIndex = options.length - 1;
      this.context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(this.props.currentMessage.text);
              break;
            default:
              break;
          }
        },
      );
    }
  }

  handleBubbleToNext() {
    if (
      isSameUser(this.props.currentMessage, this.props.nextMessage) &&
      isSameDay(this.props.currentMessage, this.props.nextMessage)
    ) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToNext,
        this.props.containerToNextStyle[this.props.position],
      ]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (
      isSameUser(this.props.currentMessage, this.props.previousMessage) &&
      isSameDay(this.props.currentMessage, this.props.previousMessage)
    ) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToPrevious,
        this.props.containerToPreviousStyle[this.props.position],
      ]);
    }
    return null;
  }

  renderMessageVideo() {
    if (this.props.currentMessage.video) {
      const { containerStyle, wrapperStyle, ...videoProps } = this.props;
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            this.player.presentFullscreenPlayer()
            // this.setState({ paused: !this.state.paused })
          }}
        >
          <View

          >
            <Video
              ref={(ref) => this.player = ref}
              repeat={true}
              resizeMode="contain"
              onEnd={() => { this.setState({ paused: true }) }}
              paused={this.state.paused}
              style={{ width: 200, height: 200 }}
              source={{ uri: this.props.currentMessage.video }}
            />
            {/* <View style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(25,25,25,0.4)'
            }} /> */}
            <Image
              source={require('./assets/images/Bitmap.png')}
              style={{ position: 'absolute', top: 60, right: 60 }}
            />
          </View>
        </TouchableWithoutFeedback>
      )
    }
    return null;
  }

  renderMessageText() {
    if (this.props.currentMessage.text) {
      const { containerStyle, wrapperStyle, ...messageTextProps } = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }
    return null;
  }

  renderMessageImage() {
    if (this.props.currentMessage.image) {
      const { containerStyle, wrapperStyle, ...messageImageProps } = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps);
      }
      return <MessageImage {...messageImageProps} />;
    }
    return null;
  }

  renderTicks() {
    const { currentMessage } = this.props;
    if (this.props.renderTicks) {
      return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== this.props.user._id) {
      return null;
    }
    if (currentMessage.sent || currentMessage.received) {
      return (
        <View style={styles.tickView}>
          {currentMessage.sent && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
          {currentMessage.received && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
        </View>
      );
    }
    return null;
  }

  renderRetry() {
    if (this.props.renderRetry) {
      return this.props.renderRetry(this.props);
    }
    return null;
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

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }

  render() {
    const {
      onPress = (item) => { }
    } = this.props
    const selected = this.props.selectedId === this.props.currentMessage._id
    const colorBackground = {
      left: selected ? '#C0C0C2' : Color.leftBubbleBackground,
      right: selected ? '#146EC0' : Color.defaultBlue
    }
    const backgroundColor = {
      backgroundColor: this.props.currentMessage.image ? null : colorBackground[this.props.position]
    }
    
      const overflow = {
      overflow: this.props.currentMessage.image ? 'hidden' : 'visible'
    }

    return (
      <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
        <View style={[{ flexDirection: 'row', alignItems: 'center' }, styles[this.props.position].margin]}>
          {this.props.position === 'right' &&
            <View style={{ marginRight: 10 }}>
              {this.renderRetry()}
            </View>
          }
          <View
            style={[
              styles[this.props.position].wrapper,
              this.props.wrapperStyle[this.props.position],
              this.handleBubbleToNext(),
              this.handleBubbleToPrevious(),
              backgroundColor,
                   overflow
            ]}
          >
            <TouchableWithoutFeedback
              onPress={() => onPress(this.props.currentMessage)}
              onLongPress={this.onLongPress}
              accessibilityTraits="text"
              {...this.props.touchableProps}
            >
              <View>
                {this.renderCustomView()}
                {this.renderMessageImage()}
                {this.renderMessageVideo()}
                {this.renderMessageText()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    );
  }

}

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.leftBubbleBackground,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    margin: {
      marginRight: 60
    }
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.defaultBlue,
      // marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
    margin: {
      marginLeft: 60
    }
  }),
  bottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tick: {
    fontSize: 10,
    backgroundColor: Color.backgroundTransparent,
    color: Color.white,
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  },
};

Bubble.contextTypes = {
  actionSheet: PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTicks: null,
  renderTime: null,
  position: 'left',
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
  renderRetry: null
};

Bubble.propTypes = {
  user: PropTypes.object.isRequired,
  touchableProps: PropTypes.object,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderRetry: PropTypes.func,
  renderTime: PropTypes.func,
  renderTicks: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  wrapperStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  bottomContainerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  tickStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
};
