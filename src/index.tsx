import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Animated, StyleSheet, View, ViewProps } from 'react-native';
import RootSiblings from 'react-native-root-siblings';

export type ModalContentProps = {
  dismiss: () => void;
};

export type ModalHandler = {
  dismiss: () => void;
};

export const showModal = <ContentProps,>(
  Content: (props: ContentProps & ModalContentProps) => JSX.Element,
  contentProps: ContentProps
) => {
  let ref: Ref | null;
  let rootSiblings: RootSiblings;
  const dismiss = () => {
    if (ref) {
      ref.animatedOut(() => {
        rootSiblings.destroy();
      });
    } else {
      rootSiblings.destroy();
    }
  };
  rootSiblings = new RootSiblings(
    (
      <Modal ref={(_ref) => (ref = _ref)}>
        <Content {...contentProps} dismiss={dismiss} />
      </Modal>
    )
  );
  return {
    dismiss: dismiss,
  } as ModalHandler;
};

type Ref = {
  animatedOut: (completion?: () => void) => void;
};

const Modal = forwardRef<Ref, ViewProps>(
  ({ style, children, ...props }, ref) => {
    const animatedOpacity = useRef(new Animated.Value(0));

    useEffect(() => {
      Animated.spring(animatedOpacity.current, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }, []);

    useImperativeHandle(ref, () => ({
      animatedOut: (completion?: () => void) => {
        Animated.spring(animatedOpacity.current, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          completion?.();
        });
      },
    }));

    return (
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.container,
            { opacity: animatedOpacity.current },
            style,
          ]}
          {...props}
        >
          {children}
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(21, 24, 25, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
