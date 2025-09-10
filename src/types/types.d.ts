// Base types
interface Point {
    x: number;
    y: number;
}

type HexString = `#${string}`;

// Go model equivalents
interface Word {
    word: string;
    count: number;
}

interface Response<T = any> {
    status_code: number;
    resp_time_start_ms: number;
    resp_time_end_ms: number;
    net_resp_time_ms: number;
    data: T;
}

interface Room {
    id: string;
    players: Record<string, Player>;
    current?: Player; // Optional since it can be null
    word: string;
    // Note: Mutex is not needed in TypeScript as it's a Go concurrency primitive
}

interface Player {
    id: string;
    // Note: WebSocket connection is handled differently in TypeScript
    room?: Room; // Optional to avoid circular reference issues
    username: string;
    score: number;
}

interface Message<T = any> {
    type: string;
    data: T;
}

interface DrawData {
    x: number;
    y: number;
    color: string;
    lineWidth: number;
    isDragging: boolean;
}

// Additional types you already had
type Draw = {
    ctx: CanvasRenderingContext2D | null | undefined;
    currentPoint: Point;
    prevPoint: Point | null;
};

type Rgba = {
    r: number;
    g: number;
    b: number;
    a: number;
};

// Utility type for API responses
type ApiResponse<T> = Response<T>;

// Specific message types for better type safety
interface WelcomeMessage {
    type: "welcome";
    data: {
        playerId: string;
        roomId: string;
    };
}

interface DrawMessage {
    type: "draw";
    data: DrawData;
}

interface PlayerJoinMessage {
    type: "player_join";
    data: {
        player: Player;
        playerCount: number;
    };
}

interface PlayerLeaveMessage {
    type: "player_leave";
    data: {
        playerId: string;
        playerCount: number;
    };
}

// Union type for all possible messages
type GameMessage = WelcomeMessage | DrawMessage | PlayerJoinMessage | PlayerLeaveMessage | Message;

// WebSocket connection state
interface WebSocketState {
    socket: WebSocket | null;
    isConnected: boolean;
    roomId: string | null;
    playerId: string | null;
}

// Room response for API endpoints
interface RoomResponse {
    room_id: string;
    player_count?: number;
    is_new_room: boolean;
}
