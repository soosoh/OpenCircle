import type { Chord, Goal, HelpRequest, Message, Point, PrivateMessage, User } from "@/types";
import { getStore } from "./client";

/**
 * Repository: the only module that talks to the data store.
 * Pages and actions import from here; they never touch a backend directly.
 */

// Users
export const listUsers = () => getStore().list<User>("users");
export const getUser = (id: string) => getStore().get<User>("users", id);
export const insertUser = (user: User) => getStore().insert("users", user);
export const updateUser = (id: string, patch: Partial<User>) => getStore().update<User>("users", id, patch);

// Chords
export const listChords = () => getStore().list<Chord>("chords");
export const getChord = (id: string) => getStore().get<Chord>("chords", id);
export const updateChord = (id: string, patch: Partial<Chord>) => getStore().update<Chord>("chords", id, patch);

// Points
export const listPoints = () => getStore().list<Point>("points");
export const getPoint = (id: string) => getStore().get<Point>("points", id);
export const insertPoint = (point: Point) => getStore().insert("points", point);
export const updatePoint = (id: string, patch: Partial<Point>) => getStore().update<Point>("points", id, patch);

// Goals
export const listGoals = () => getStore().list<Goal>("goals");
export const getGoal = (id: string) => getStore().get<Goal>("goals", id);
export const insertGoal = (goal: Goal) => getStore().insert("goals", goal);
export const updateGoal = (id: string, patch: Partial<Goal>) => getStore().update<Goal>("goals", id, patch);

// Point chat
export const listMessages = () => getStore().list<Message>("messages");
export const insertMessage = (message: Message) => getStore().insert("messages", message);

// SOS / help requests
export const listHelpRequests = () => getStore().list<HelpRequest>("help_requests");
export const getHelpRequest = (id: string) => getStore().get<HelpRequest>("help_requests", id);
export const insertHelpRequest = (request: HelpRequest) => getStore().insert("help_requests", request);
export const updateHelpRequest = (id: string, patch: Partial<HelpRequest>) =>
  getStore().update<HelpRequest>("help_requests", id, patch);

// Moderator private messages
export const listPrivateMessages = () => getStore().list<PrivateMessage>("private_messages");
export const insertPrivateMessage = (message: PrivateMessage) => getStore().insert("private_messages", message);
