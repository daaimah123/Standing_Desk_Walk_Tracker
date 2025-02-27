"use client"

import type { UserProfile, WeightEntry, WalkSession, Milestone } from "./types"
import { v4 as uuidv4 } from "uuid"

// Local storage keys
const USER_PROFILE_KEY = "standing-desk-tracker-profile"
const WEIGHT_ENTRIES_KEY = "standing-desk-tracker-weight"
const WALK_SESSIONS_KEY = "standing-desk-tracker-walks"
const MILESTONES_KEY = "standing-desk-tracker-milestones"

// User Profile
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile))
  }
}

export function getUserProfile(): UserProfile | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(USER_PROFILE_KEY)
    if (data) {
      const profile = JSON.parse(data) as UserProfile
      // Convert string date to Date object
      profile.targetDate = new Date(profile.targetDate)
      return profile
    }
  }
  return null
}

// Weight Entries
export function saveWeightEntry(entry: WeightEntry): void {
  if (typeof window !== "undefined") {
    const entries = getWeightEntries()

    // If entry has no ID, create one
    if (!entry.id) {
      entry.id = uuidv4()
    }

    // Find if entry with same ID exists
    const index = entries.findIndex((e) => e.id === entry.id)

    if (index >= 0) {
      // Update existing entry
      entries[index] = entry
    } else {
      // Add new entry
      entries.push(entry)
    }

    localStorage.setItem(WEIGHT_ENTRIES_KEY, JSON.stringify(entries))
  }
}

export function getWeightEntries(): WeightEntry[] {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(WEIGHT_ENTRIES_KEY)
    if (data) {
      const entries = JSON.parse(data) as WeightEntry[]
      // Convert string dates to Date objects
      return entries.map((entry) => ({
        ...entry,
        date: new Date(entry.date),
      }))
    }
  }
  return []
}

export function deleteWeightEntry(id: string): void {
  if (typeof window !== "undefined") {
    const entries = getWeightEntries()
    const filteredEntries = entries.filter((entry) => entry.id !== id)
    localStorage.setItem(WEIGHT_ENTRIES_KEY, JSON.stringify(filteredEntries))
  }
}

// Walk Sessions
export function saveWalkSession(session: WalkSession): void {
  if (typeof window !== "undefined") {
    const sessions = getWalkSessions()

    // If session has no ID, create one
    if (!session.id) {
      session.id = uuidv4()
    }

    // Find if session with same ID exists
    const index = sessions.findIndex((s) => s.id === session.id)

    if (index >= 0) {
      // Update existing session
      sessions[index] = session
    } else {
      // Add new session
      sessions.push(session)
    }

    localStorage.setItem(WALK_SESSIONS_KEY, JSON.stringify(sessions))
  }
}

export function getWalkSessions(): WalkSession[] {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(WALK_SESSIONS_KEY)
    if (data) {
      const sessions = JSON.parse(data) as WalkSession[]
      // Convert string dates to Date objects
      return sessions.map((session) => ({
        ...session,
        date: new Date(session.date),
      }))
    }
  }
  return []
}

export function deleteWalkSession(id: string): void {
  if (typeof window !== "undefined") {
    const sessions = getWalkSessions()
    const filteredSessions = sessions.filter((session) => session.id !== id)
    localStorage.setItem(WALK_SESSIONS_KEY, JSON.stringify(filteredSessions))
  }
}

// Milestones
export function saveMilestone(milestone: Milestone): void {
  if (typeof window !== "undefined") {
    const milestones = getMilestones()

    // If milestone has no ID, create one
    if (!milestone.id) {
      milestone.id = uuidv4()
    }

    // Find if milestone with same ID exists
    const index = milestones.findIndex((m) => m.id === milestone.id)

    if (index >= 0) {
      // Update existing milestone
      milestones[index] = milestone
    } else {
      // Add new milestone
      milestones.push(milestone)
    }

    localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones))
  }
}

export function getMilestones(): Milestone[] {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(MILESTONES_KEY)
    if (data) {
      const milestones = JSON.parse(data) as Milestone[]
      // Convert string dates to Date objects
      return milestones.map((milestone) => ({
        ...milestone,
        date: new Date(milestone.date),
      }))
    }
  }
  return []
}

export function deleteMilestone(id: string): void {
  if (typeof window !== "undefined") {
    const milestones = getMilestones()
    const filteredMilestones = milestones.filter((milestone) => milestone.id !== id)
    localStorage.setItem(MILESTONES_KEY, JSON.stringify(filteredMilestones))
  }
}

