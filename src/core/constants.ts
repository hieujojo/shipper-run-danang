// Canvas
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const ASPECT_RATIO = 16 / 9;

export const ROAD_TOP = CANVAS_HEIGHT * 0.2;
export const ROAD_BOTTOM = CANVAS_HEIGHT * 0.8;

// Game
export const TARGET_FPS = 60;
export const LANE_COUNT = 3;

// Player (quay ngang)
export const PLAYER_WIDTH = 50;
export const PLAYER_HEIGHT = 30;

// Giới hạn di chuyển ngang của xe — cho phép chạy gần như HẾT chiều rộng canvas,
// chỉ chừa margin bằng nửa PLAYER_WIDTH (vì sprite dùng anchor 0.5 ở tâm) để
// xe không bị cắt hình khi chạm mép trái/phải màn hình.
// Tính theo CANVAS_WIDTH nên tự co giãn nếu sau này đổi độ phân giải canvas.
export const PLAYER_X_MIN = PLAYER_WIDTH / 2;
export const PLAYER_X_MAX = CANVAS_WIDTH - PLAYER_WIDTH / 2;

// Traffic
export const MIN_VEHICLE_SPEED = 2;
export const MAX_VEHICLE_SPEED = 8;
export const SPAWN_INTERVAL = 60; // frames

// Speed Scaling (Subway Surfers style)
export const BASE_SCROLL_SPEED = 5;    // tốc độ scroll gốc (px/frame)
export const INITIAL_MULTIPLIER = 0.3; // nhân tốc độ ban đầu — rất chậm
export const SPEED_INCREASE_RATE = 0.02; // tăng mỗi giây (fallback)
export const MAX_SPEED_MULTIPLIER = 2.5; // giới hạn tối đa (fallback)
export const MOTION_BLUR_THRESHOLD = 1.2; // ngưỡng tốc độ bắt đầu motion blur


// Rush Hour
export const RUSH_HOUR_INTERVAL = 30; // seconds
export const RUSH_HOUR_MULTIPLIER_MAX = 2.5;

// Scoring
export const SCORE_PER_SECOND = 10;
export const SCORE_PER_DELIVERY = 100;