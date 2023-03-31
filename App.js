import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';

const TensorCamera = cameraWithTensors(Camera);

const IS_ANDROID = Platform.OS === 'android';
const IS_IOS = Platform.OS === 'ios';

const CAM_PREVIEW_WIDTH = Dimensions.get('window').width;
const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);

const MIN_KEYPOINT_SCORE = 0.3;
const OUTPUT_TENSOR_WIDTH = 180;
const OUTPUT_TENSOR_HEIGHT = OUTPUT_TENSOR_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);


export default function App() {
  const cameraRef = useRef(null);
  const [tfReady, setTfReady] = useState(false);
  const [model, setModel] = useState();
  const [poses, setPoses] = useState([]);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const rafId = useRef(null);

  useEffect(() => {
    async function prepare() {
      rafId.current = null;

      await Camera.requestCameraPermissionsAsync();
      await tf.ready();
      
      const detectorConfig = {
        runtime: 'tfjs',
        enableSmoothing: true,
        modelType: 'lite'
      };

      const model = await posedetection.createDetector(
        posedetection.SupportedModels.BlazePose,
        detectorConfig
      );
      setModel(model);
      setTfReady(true);
    }
    prepare();
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current != null && rafId.current !== 0) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, []);

  const handleCameraStream = async (images) => {
    const loop = async () => {
      const imageTensor = images.next().value;
  
      const poses = await model.estimatePoses(
        imageTensor,
        undefined,
        Date.now()
      );
      setPoses(poses);
      tf.dispose([imageTensor]);
  
      if (rafId.current === 0) {
        return;
      }
  
      rafId.current = requestAnimationFrame(loop);
    };
  
    loop();
  };
  const renderPose = () => {
    if (poses != null && poses.length > 0) {
      const keypoints = poses[0].keypoints
        .filter((k) => (k.score ?? 0) > MIN_KEYPOINT_SCORE)
        .map((k) => {
          const x = k.x;
          const y = k.y;
          const z = k.z
          const name = k.name
          console.log({x}, {y}, {z}, {name})
          return (
            <Text>
              {x} {y} {z}
            </Text>
          );
        });
    }
  };
  
  
  const renderCameraTypeSwitcher = () => {
    return (
      <View
        style={styles.cameraTypeSwitcher}
        onTouchEnd={handleSwitchCameraType}
      >
        <Text>
          Switch to{' '}
          {cameraType === Camera.Constants.Type.front ? 'back' : 'front'} camera
        </Text>
      </View>
    );
  };
  
  const handleSwitchCameraType = () => {
    if (cameraType === Camera.Constants.Type.front) {
      setCameraType(Camera.Constants.Type.back);
    } else {
      setCameraType(Camera.Constants.Type.front);
    }
  };
  
  
  if (!tfReady) {
    return (
      <View style={styles.loadingMsg}>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <View
      >
        <TensorCamera
          ref={cameraRef}
          style={styles.camera}
          autorender={true}
          type={cameraType}
          // tensor related props
          resizeWidth={OUTPUT_TENSOR_WIDTH}
          resizeHeight={OUTPUT_TENSOR_HEIGHT}
          resizeDepth={3}
          onReady={handleCameraStream}
        />
        {renderPose()}
        {renderCameraTypeSwitcher()}
      </View>
    );
  }}

  const styles = StyleSheet.create({
    containerPortrait: {
      position: 'relative',
      width: CAM_PREVIEW_WIDTH,
      height: CAM_PREVIEW_HEIGHT,
      marginTop: Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2,
    },
    containerLandscape: {
      position: 'relative',
      width: CAM_PREVIEW_HEIGHT,
      height: CAM_PREVIEW_WIDTH,
      marginLeft: Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2,
    },
    loadingMsg: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    camera: {
      width: '100%',
      height: '100%',
      zIndex: 1,
    },
    svg: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: 30,
    },
    fpsContainer: {
      position: 'absolute',
      top: 10,
      left: 10,
      width: 80,
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, .7)',
      borderRadius: 2,
      padding: 8,
      zIndex: 20,
    },
    cameraTypeSwitcher: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 180,
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, .7)',
      borderRadius: 2,
      padding: 8,
      zIndex: 20,
    },
  });