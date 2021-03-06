/* eslint no-use-before-define: ["error", { "variables": false }] */

import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, SafeAreaView, ViewPropTypes, Dimensions, Modal, View, TouchableOpacity } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';


const { width, height } = Dimensions.get('window')
export default function MessageImage({
  containerStyle,
  lightboxProps,
  imageProps,
  imageStyle,
  currentMessage,
  onOpen,
  onClose,
  onCancel,
  showModal
}) {
  const convertToImgix = (url, options = {}) => {
    if (!url) return ''
    const queryStringArr = []
    for (const key of Object.keys(options)) {
      queryStringArr.push(`${key}=${options[key]}`)
    }

    let queryString = ''
    if (queryStringArr.length > 0) {
      queryString =
        `?${queryStringArr.join('&')}&auto=format&dpr=2.0&fm=jpg&q=40"`
    } else {
      queryString =
        `?auto=format&fit=crop&dpr=2.0&fm=jpg&q=40`
    }
    url = url
      .replace(
        'https://skylabchat.s3.ap-south-1.amazonaws.com/',
        'http://messageinternal.imgix.net/'
      ) + queryString

    return url
  }
  return (
    <View>
      <Modal
        visible={showModal} transparent={true}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer
            onCancel={onCancel}
            enableSwipeDown
            enableImageZoom
            renderIndicator={() => {
              return <View />
            }}
            imageUrls={[{ url: convertToImgix(currentMessage.image, { w: width, fit: 'fill' }) }]} />

          <TouchableOpacity
            style={{
              width: 40, height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              left: 15,
              top: 20
            }}
            onPress={onCancel}>
            <Image
              resizeMode="contain"
              style={{ width: 24, height: 24, tintColor: 'white' }}
              source={require('./assets/images/ic_close.png')}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      <View
        style={[styles.container, containerStyle]}>
        <Image
          {...imageProps}
          style={styles.image}
          resizeMethod="resize"
          source={{ uri: convertToImgix(currentMessage.image, { w: 200, h: 300, fit: 'crop' }) }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 300,
    backgroundColor: '#7F8284'
  },
  image: {
    flex: 1
  },
  imageActive: {
    flex: 1,
    resizeMode: 'cover',
  },
  closeButton: {
    fontSize: 18,
  },
  closeHolder: {
    width: 32,
    height: 32,
    marginTop: 15,
    marginLeft: 15,
    borderRadius: 16,
    backgroundColor: '#878585',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

MessageImage.defaultProps = {
  currentMessage: {
    image: null,
  },
  containerStyle: {},
  imageStyle: {},
  imageProps: {},
  lightboxProps: {},
  onOpen: () => { },
  onClose: () => { },
  onCancel: () => { },
  showModal: false
};

MessageImage.propTypes = {
  currentMessage: PropTypes.object,
  containerStyle: ViewPropTypes.style,
  imageStyle: Image.propTypes.style,
  imageProps: PropTypes.object,
  lightboxProps: PropTypes.object,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onCancel: PropTypes.func,
  showModal: PropTypes.bool
};
