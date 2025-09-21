// This file is a central place to declare module declarations for files that don't have type definitions
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.svg';
declare module '*.gif';
declare module '*.webp';
declare module '*.ico';
declare module '*.bmp';

declare module '*.json' {
    const value: any;
    export default value;
}

declare module '*.css' {
    const styles: { [className: string]: string };
    export default styles;
}