// Canvas
export const CANVAS_WIDTH = 405;
export const CANVAS_HEIGHT = 720;
export const ASPECT_RATIO = 9 / 16;

// Game
export const TARGET_FPS = 60;
export const LANE_COUNT = 3;

// Player
export const PLAYER_SPEED = 5;
export const PLAYER_WIDTH = 30;
export const PLAYER_HEIGHT = 50;

// Traffic
export const MIN_VEHICLE_SPEED = 2;
export const MAX_VEHICLE_SPEED = 8;
export const SPAWN_INTERVAL = 60; // frames

// Speed Scaling (Subway Surfers style)
export const BASE_SCROLL_SPEED = 5;    // tốc độ scroll gốc (px/frame)
export const INITIAL_MULTIPLIER = 0.3; // nhân tốc độ ban đầu — rất chậm
export const SPEED_INCREASE_RATE = 0.02; // tăng mỗi giây (fallback)
export const MAX_SPEED_MULTIPLIER = 2.5; // giới hạn tối đa (fallback)


// Rush Hour
export const RUSH_HOUR_INTERVAL = 30; // seconds
export const RUSH_HOUR_MULTIPLIER_MAX = 2.5;

// Scoring
export const SCORE_PER_SECOND = 10;
export const SCORE_PER_DELIVERY = 100;