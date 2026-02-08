// Shared collision system for all solid objects in the game world.
// Both player (Boat) and AI boats must respect these colliders.

export interface CircleCollider {
  x: number;
  z: number;
  radius: number;
  label: string;
}

// Static world colliders — island, fish statue pedestal
export const WORLD_COLLIDERS: CircleCollider[] = [
  // TroutIsland: group at [0, 0, -185], beach ring radius ~14
  { x: 0, z: -185, radius: 15, label: 'island' },
  // FishStatue island base: group at [0, 0, -90], cylinder radius ~10
  { x: 0, z: -90, radius: 11, label: 'statue' },
];

/**
 * Resolve a position against all solid colliders.
 * Returns the corrected [x, z] pushed outside any overlapping collider.
 * Also returns whether a collision occurred.
 */
export function resolveCollisions(
  x: number,
  z: number,
  boatRadius: number,
  extraColliders?: CircleCollider[]
): { x: number; z: number; hit: boolean } {
  let cx = x;
  let cz = z;
  let hit = false;

  const allColliders = extraColliders
    ? WORLD_COLLIDERS.concat(extraColliders)
    : WORLD_COLLIDERS;

  for (let i = 0; i < allColliders.length; i++) {
    const col = allColliders[i];
    const dx = cx - col.x;
    const dz = cz - col.z;
    const distSq = dx * dx + dz * dz;
    const minDist = col.radius + boatRadius;
    const minDistSq = minDist * minDist;

    if (distSq < minDistSq) {
      hit = true;
      const dist = Math.sqrt(distSq) || 0.01;
      // Push out to the edge
      cx = col.x + (dx / dist) * minDist;
      cz = col.z + (dz / dist) * minDist;
    }
  }

  return { x: cx, z: cz, hit };
}
