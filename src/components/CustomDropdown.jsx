import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal,
    Dimensions,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { height } = Dimensions.get('window');

const CustomDropdown = ({
    data = [],
    value,
    onSelect,
    placeholder = 'Select an option',
    disabled = false,
}) => {
    const [visible, setVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const DropdownButtonRef = useRef();
    const animatedValue = useRef(new Animated.Value(0)).current;

    const toggleDropdown = () => {
        if (disabled) return;
        DropdownButtonRef.current.measure((_fx, _fy, _w, h, _px, py) => {
            setDropdownTop(py + h);
        });
        if (visible) {
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setVisible(false));
        } else {
            setVisible(true);
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    };

    const onItemSelect = (item) => {
        onSelect(item);
        toggleDropdown();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => onItemSelect(item)}
        >
            <Text style={[styles.dropdownItemText, value === item && styles.selectedItemText]}>
                {item}
            </Text>
            {value === item && <Icon name="check" size={20} color="#6a1b9a" />}
        </TouchableOpacity>
    );

    const renderDropdown = () => {
        const translateY = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
        });

        const opacity = animatedValue;

        return (
            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={toggleDropdown}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={toggleDropdown}
                    activeOpacity={1}
                >
                    <Animated.View
                        style={[
                            styles.dropdown,
                            { top: dropdownTop },
                            { opacity, transform: [{ translateY }] },
                        ]}
                    >
                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            bounces={false}
                            showsVerticalScrollIndicator={true}
                            style={{ maxHeight: height * 0.4 }}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        );
    };

    return (
        <View>
            <TouchableOpacity
                ref={DropdownButtonRef}
                style={[
                    styles.dropdownButton,
                    disabled && styles.disabledDropdown,
                ]}
                onPress={toggleDropdown}
                disabled={disabled}
            >
                <Text
                    style={[
                        styles.dropdownButtonText,
                        !value && styles.placeholderText,
                        disabled && styles.disabledText,
                    ]}
                    numberOfLines={1}
                >
                    {value || placeholder}
                </Text>
                <Icon
                    name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color={disabled ? "#ccc" : "#757575"}
                />
            </TouchableOpacity>
            {visible && renderDropdown()}
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 5,
    },
    disabledDropdown: {
        backgroundColor: '#f9f9f9',
        borderColor: '#e5e5e5',
    },
    dropdownButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#212529',
    },
    placeholderText: {
        color: '#757575',
    },
    disabledText: {
        color: '#aaa',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: '#fff',
        width: '92%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 5,
    },
    dropdownItem: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#212529',
    },
    selectedItemText: {
        color: '#6a1b9a',
        fontWeight: '500',
    },
});

export default CustomDropdown;