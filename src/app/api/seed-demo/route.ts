import { NextResponse } from 'next/server';
import { adminDb, adminRtdb } from '@/lib/firebaseAdmin';

export async function POST() {
  try {
    const incidentId = 'demo-incident-' + Date.now();
    const now = Date.now();
    
    // 1. Create Incident
    const incidentData = {
      id: incidentId,
      type: 'FIRE',
      severity: 'HIGH',
      status: 'active',
      location: 'Floor 2, Conference Hall',
      createdAt: now - (45 * 60000), // 45 mins ago
      createdBy: 'admin@hotel.com',
    };
    
    await adminDb().collection('incidents').doc(incidentId).set(incidentData);
    
    // 2. RTDB
    await adminRtdb().ref('activeIncident').set(incidentData);

    // 3. Tasks
    const tasks = [
      { id: 't1', title: 'Evacuate Floor 2', assignedRole: 'security', status: 'completed', priority: 'critical', estimatedMinutes: 10 },
      { id: 't2', title: 'Disable elevators to Floor 2', assignedRole: 'security', status: 'completed', priority: 'critical', estimatedMinutes: 5 },
      { id: 't3', title: 'Setup triage in Lobby', assignedRole: 'medical', status: 'in-progress', priority: 'high', estimatedMinutes: 15 },
      { id: 't4', title: 'Notify Fire Department', assignedRole: 'management', status: 'completed', priority: 'critical', estimatedMinutes: 5 },
      { id: 't5', title: 'Check stairwell C for stragglers', assignedRole: 'security', status: 'pending', priority: 'high', estimatedMinutes: 20 },
      { id: 't6', title: 'Prepare burn kits', assignedRole: 'medical', status: 'pending', priority: 'high', estimatedMinutes: 5 },
      { id: 't7', title: 'Draft guest communications', assignedRole: 'management', status: 'in-progress', priority: 'medium', estimatedMinutes: 15 },
      { id: 't8', title: 'Secure perimeter doors', assignedRole: 'security', status: 'pending', priority: 'medium', estimatedMinutes: 10 },
      { id: 't9', title: 'Coordinate with arriving EMS', assignedRole: 'admin', status: 'pending', priority: 'high', estimatedMinutes: 30 },
      { id: 't10', title: 'Review CCTV of Conference Hall', assignedRole: 'security', status: 'pending', priority: 'high', estimatedMinutes: 20 },
    ];
    
    const batch = adminDb().batch();
    tasks.forEach(t => {
      const ref = adminDb().collection('tasks').doc(t.id);
      batch.set(ref, { ...t, incidentId, createdAt: now - (44 * 60000) });
    });

    // 4. Logs (Simulate a timeline)
    const logs = [
      { m: "Smoke detector triggered in Conference Hall", r: "system", a: "System", t: 45 },
      { m: "Emergency declared: FIRE at Floor 2, Conference Hall", r: "admin", a: "Admin User", t: 44 },
      { m: "Automated task generation completed", r: "system", a: "System", t: 44 },
      { m: "Fire Department dispatched", r: "management", a: "Manager", t: 42 },
      { m: "Marked task 'Notify Fire Department' as completed", r: "management", a: "Manager", t: 41 },
      { m: "Elevators disabled remotely", r: "system", a: "System", t: 40 },
      { m: "Marked task 'Disable elevators to Floor 2' as completed", r: "system", a: "System", t: 40 },
      { m: "Floor 2 evacuation initiated", r: "security", a: "Security Officer", t: 38 },
      { m: "Marked task 'Evacuate Floor 2' as completed", r: "security", a: "Security Officer", t: 28 },
      { m: "Triage AI: Medics advised to prep for smoke inhalation", r: "medical", a: "Medical Staff", t: 25 },
      { m: "Marked task 'Setup triage in Lobby' as in-progress", r: "medical", a: "Medical Staff", t: 24 },
      { m: "Guest communications draft started", r: "management", a: "Manager", t: 15 },
      { m: "Marked task 'Draft guest communications' as in-progress", r: "management", a: "Manager", t: 14 },
      { m: "Fire dept arrived on scene", r: "security", a: "Security Officer", t: 5 },
      { m: "All known personnel accounted for", r: "admin", a: "Admin User", t: 1 },
    ];

    logs.forEach((l, i) => {
      const ref = adminDb().collection('logs').doc();
      batch.set(ref, {
        incidentId,
        message: l.m,
        actorRole: l.r,
        actor: l.a,
        timestamp: now - (l.t * 60000),
      });
    });

    await batch.commit();

    return NextResponse.json({ success: true, message: "Demo data seeded successfully!" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
