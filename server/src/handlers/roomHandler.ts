import { Room } from "src/models/room.model";
import { objectIdRegex } from "src/schema/songSchemas";
import {
  CreateRoomSchema,
  JoinRoomSchema,
  RefreshJoinRoomSchema,
} from "src/schema/roomSchemas";
import RoomService from "src/services/RoomService";
import { ClientMessage } from "src/websocket/WebSocketService";
import { WebSocket } from "ws";
import { z } from "zod";

interface IHandleArg {
  ws: WebSocket;
  clientData: ClientMessage;
  wsService: any;
}

export async function handleCreateRoom({
  ws,
  clientData,
  wsService,
}: IHandleArg) {
  try {
    const parsedCreateRoomData = CreateRoomSchema.safeParse(clientData.payload);

    if (!parsedCreateRoomData.success) {
      const errorMsg = parsedCreateRoomData.error.errors
        .map((err) => err.message)
        .join(", ");
      wsService.sendMessage(ws, "ERROR", errorMsg);
      return;
    }

    const { roomName, roomPassword, roomType, userId } =
      parsedCreateRoomData.data;

    const room = await RoomService.createRoom({
      ws,
      roomName,
      roomPassword,
      roomType,
      userId,
    });

    if (!room) {
      wsService.sendMessage(ws, "ERROR", "Failed to create room");
      return;
    }

    wsService.sendMessage(ws, "CREATE_ROOM", room);
    wsService.broadcast("ADD_ROOM", room);
  } catch (error) {
    console.error("Error creating room:", error);
    wsService.sendMessage(
      ws,
      "ERROR",
      "An unexpected error occurred while creating room."
    );
  }
}

export async function handleJoinRoom({
  ws,
  clientData,
  wsService,
}: IHandleArg) {
  try {
    const parsedJoinRoomData = JoinRoomSchema.safeParse(clientData.payload);

    if (!parsedJoinRoomData.success) {
      const errorMsg = parsedJoinRoomData.error.errors
        .map((err) => err.message)
        .join(", ");
      wsService.sendMessage(ws, "ERROR", errorMsg);
      return;
    }

    const { roomPassword, roomId, userId } = parsedJoinRoomData.data;

    const joinedRoomData = await RoomService.joinRoom({
      ws,
      roomPassword,
      roomId,
      userId,
    });
    if (joinedRoomData) {
      wsService.sendMessageToEveryoneExpectSenderInRoom(
        ws,
        joinedRoomData.connectedClients,
        "USER_JOINED",
        `${joinedRoomData.userName} joined the room`
      );

      wsService.sendMessageToEveryoneExceptOwnerInRoom(
        joinedRoomData?.ownerWs,
        joinedRoomData?.connectedClients,
        "JOIN_ROOM",
        joinedRoomData?.roomId
      );
    }
  } catch (error) {
    console.error("Error joining room:", error);
    let errMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while joining room.";
    wsService.sendMessage(ws, "ERROR", errMessage);
  }
}

export async function handleRefreshJoinRoom({
  clientData,
  ws,
  wsService,
}: IHandleArg) {
  try {
    const parsedRefreshJoinRoom = RefreshJoinRoomSchema.safeParse(
      clientData.payload
    );

    if (!parsedRefreshJoinRoom.success) {
      const errorMsg = parsedRefreshJoinRoom.error.errors
        .map((err) => err.message)
        .join(", ");
      wsService.sendMessage(ws, "ERROR", errorMsg);
      return;
    }

    const { roomId } = parsedRefreshJoinRoom.data;
    const { noOfJoinedUsers, connectedClients } =
      await RoomService.refreshJoinRoom({
        ws,
        roomId,
        userId: ws.userId!,
      });

    wsService.sendMessageToEveryoneInRoom(
      connectedClients,
      "REFRESH_ROOM",
      noOfJoinedUsers
    );
  } catch (error) {
    console.error("Error refresh join room:", error);
    let errMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while refreshing join room.";
    wsService.sendMessage(ws, "ERROR", errMessage);
  }
}

export async function handleLeaveRoom({
  clientData,
  ws,
  wsService,
}: IHandleArg) {
  try {
    const parsedHandleLeaveRoom = z
      .object({
        roomId: z.string().regex(objectIdRegex),
        userId: z.string().regex(objectIdRegex),
      })
      .safeParse(clientData.payload);

    if (!parsedHandleLeaveRoom.success) {
      const errorMsg = parsedHandleLeaveRoom.error.errors
        .map((err) => err.message)
        .join(", ");
      wsService.sendMessage(ws, "ERROR", errorMsg);
      return;
    }

    const { roomId, userId } = parsedHandleLeaveRoom.data;

    const { username, connectedClient } = await RoomService.leaveRoom({
      userId,
      roomId,
    });

    wsService.sendMessageToEveryoneExpectSenderInRoom(
      ws,
      connectedClient,
      "LEFT_ROOM",
      {
        message: `${username} left the room`,
        noOfJoinedUsers: connectedClient!.size - 1,
      }
    );

    wsService.sendMessage(ws, "LEAVE_ROOM", `${username} left the room`);
    RoomService.rooms.get(roomId)?.users.delete(ws);
  } catch (error) {
    console.error("Error joining room:", error);
    let errMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while joining room.";
    wsService.sendMessage(ws, "ERROR", errMessage);
  }
}

export async function handleEndRoom({ clientData, ws, wsService }: IHandleArg) {
  try {
    const parsedHandleLeaveRoom = z
      .object({
        roomId: z.string().regex(objectIdRegex),
        userId: z.string().regex(objectIdRegex),
      })
      .safeParse(clientData.payload);

    if (!parsedHandleLeaveRoom.success) {
      const errorMsg = parsedHandleLeaveRoom.error.errors
        .map((err) => err.message)
        .join(", ");
      wsService.sendMessage(ws, "ERROR", errorMsg);
      return;
    }

    const { roomId, userId } = parsedHandleLeaveRoom.data;

    const { connectedClients } = await RoomService.endRoom({
      userId,
      roomId,
    });

    wsService.sendMessage(ws, "END_ROOM", roomId);
    wsService.sendMessageToEveryoneExceptOwnerInRoom(
      ws,
      connectedClients,
      "ROOM_ENDED",
      roomId
    );
    wsService.broadcast("REMOVE_ROOM", roomId);

    RoomService.rooms.delete(roomId);
  } catch (error) {
    console.error("Error joining room:", error);
    let errMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while joining room.";
    wsService.sendMessage(ws, "ERROR", errMessage);
  }
}
