import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    children: React.ReactNode;
}

export const Button = forwardRef<any, ButtonProps>(
    ({ variant = 'default', size = 'default', children, style: customStyle, ...props }, ref) => {
        const getContainerStyle = (): any[] => {
            let style: any[] = [styles.base];
            switch (variant) {
                case 'default':
                style.push(styles.defaultVariant);
                break;
                case 'secondary':
                style.push(styles.secondaryVariant);
                break;
                case 'outline':
                style.push(styles.outlineVariant);
                break;
                case 'ghost':
                style.push(styles.ghostVariant);
                break;
            }

            switch (size) {
                case 'default':
                style.push(styles.defaultSize);
                break;
                case 'sm':
                style.push(styles.smSize);
                break;
                case 'lg':
                style.push(styles.lgSize);
                break;
                case 'icon':
                style.push(styles.iconSize);
                break;
            }

            return style;
        };

        const getTextStyle = (): any[] => {
            let style: any[] = [styles.textBase];
            switch (variant) {
                case 'default':
                style.push(styles.defaultText);
                break;
                case 'secondary':
                style.push(styles.secondaryText);
                break;
                case 'outline':
                case 'ghost':
                style.push(styles.outlineText);
                break;
            }
            return style;
        };
        return (
            <TouchableOpacity
                ref={ref}
                style={[getContainerStyle(), customStyle]}
                activeOpacity={0.8}
                {...props}
            >
                {typeof children === 'string' ? (
                <Text style={getTextStyle()}>{children}</Text>
                ) : (
                children
                )}
            </TouchableOpacity>
        );
    }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
    base: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
    },
    defaultVariant: {
        backgroundColor: '#6366f1', // indigo-500
    },
    secondaryVariant: {
        backgroundColor: '#e0e7ff', // indigo-100
    },
    outlineVariant: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#6366f1',
    },
    ghostVariant: {
        backgroundColor: 'transparent',
    },
    defaultSize: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    smSize: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    lgSize: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    iconSize: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBase: {
        fontWeight: '600',
        fontSize: 16,
    },
    defaultText: {
        color: '#ffffff',
    },
    secondaryText: {
        color: '#4338ca', // indigo-700
    },
    outlineText: {
        color: '#6366f1', // indigo-500
    },
});
