import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'Dr. Saria El Hachem Clinic <no-reply@drsariaelhachem.com>';
const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL || 'dr.saria@clinic.ae';
const PORTAL_URL = process.env.FRONTEND_URL || 'https://drsariaelhachem.com';

// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dr. Saria El Hachem Patient Portal</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:26px;margin-bottom:14px;">🏥</div>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Dr. Saria El Hachem</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Family Medicine · Dubai</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">Dr. Saria El Hachem Patient Portal</p>
            <p style="margin:0;color:#9ca3af;font-size:11px;">This is an automated message. Please do not reply directly to this email.<br/>
            For assistance, contact the clinic directly.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />`;
}

function button(text: string, href: string, color = '#2563eb'): string {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;letter-spacing:0.1px;">${text}</a>
  </div>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#6b7280;font-size:13px;font-weight:500;width:140px;">${label}</td>
    <td style="padding:8px 0;color:#111827;font-size:13px;">${value}</td>
  </tr>`;
}

// ─── 1. Patient → Registration Confirmation ───────────────────────────────────

export async function sendRegistrationConfirmation(patient: {
  first_name: string; last_name: string; email: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const html = layout(`
    <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">Registration Received!</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
      Dear <strong>${patient.first_name}</strong>, thank you for registering with the patient portal.
      Your request has been received and is currently under review by Dr. El Hachem.
    </p>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;color:#1d4ed8;font-size:13px;font-weight:600;">⏳ What happens next?</p>
      <ul style="margin:0;padding-left:18px;color:#1e40af;font-size:13px;line-height:1.8;">
        <li>Dr. El Hachem will review your registration</li>
        <li>You'll receive an email confirmation once approved</li>
        <li>You can then sign in to view your medical records</li>
      </ul>
    </div>

    ${divider()}
    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      Need urgent access? Please contact the clinic directly.<br/>
      Registered with: <strong>${patient.email}</strong>
    </p>
  `);

  await resend.emails.send({
    from: FROM,
    to: patient.email,
    subject: 'Registration Received — Dr. Saria El Hachem Patient Portal',
    html,
  });
}

// ─── 2. Doctor → New Patient Alert ───────────────────────────────────────────

export async function sendNewPatientAlert(patient: {
  id: string; first_name: string; last_name: string; email: string;
  phone?: string | null; date_of_birth?: string | null; gender?: string | null;
  created_at?: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const registered = patient.created_at
    ? new Date(patient.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Just now';

  const html = layout(`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="background:#fef3c7;border-radius:50%;width:44px;height:44px;line-height:44px;text-align:center;font-size:20px;flex-shrink:0;">🔔</div>
      <div>
        <h2 style="margin:0;color:#111827;font-size:18px;font-weight:700;">New Patient Registration</h2>
        <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Pending your approval in the portal</p>
      </div>
    </div>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        ${infoRow('Full name', `${patient.first_name} ${patient.last_name}`)}
        ${infoRow('Email', patient.email)}
        ${patient.phone ? infoRow('Phone', patient.phone) : ''}
        ${patient.date_of_birth ? infoRow('Date of birth', patient.date_of_birth) : ''}
        ${patient.gender ? infoRow('Gender', patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)) : ''}
        ${infoRow('Registered', registered)}
      </table>
    </div>

    ${button('Review & Approve Patient', `${PORTAL_URL}/doctor`, '#2563eb')}

    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      Log in to the portal to approve or reject this registration request.
    </p>
  `);

  await resend.emails.send({
    from: FROM,
    to: DOCTOR_EMAIL,
    subject: `New Patient Registration — ${patient.first_name} ${patient.last_name}`,
    html,
  });
}

// ─── 3. Patient → Approval Notification ──────────────────────────────────────

export async function sendApprovalNotification(patient: {
  first_name: string; last_name: string; email: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const html = layout(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#dcfce7;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px;margin-bottom:12px;">✅</div>
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">You're Approved!</h2>
      <p style="margin:0;color:#6b7280;font-size:14px;">Your patient portal account is now active</p>
    </div>

    <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.7;text-align:center;">
      Dear <strong>${patient.first_name}</strong>,<br/>
      Dr. El Hachem has approved your registration. You can now sign in to the patient portal to view
      your medical records, test results, prescriptions, and more.
    </p>

    ${button('Sign In to Portal', `${PORTAL_URL}/login`, '#16a34a')}

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px;margin-top:8px;">
      <p style="margin:0 0 8px;color:#15803d;font-size:13px;font-weight:600;">What you can access:</p>
      <ul style="margin:0;padding-left:18px;color:#166534;font-size:13px;line-height:1.8;">
        <li>Your complete medical records</li>
        <li>Lab results &amp; blood test reports</li>
        <li>Prescriptions &amp; medication history</li>
        <li>Uploaded X-rays &amp; documents</li>
      </ul>
    </div>

    ${divider()}
    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      Signing in with: <strong>${patient.email}</strong>
    </p>
  `);

  await resend.emails.send({
    from: FROM,
    to: patient.email,
    subject: 'Your Account is Approved — Dr. Saria El Hachem Patient Portal',
    html,
  });
}

// ─── 4. Patient → Account Deactivated ────────────────────────────────────────

export async function sendDeactivationNotification(patient: {
  first_name: string; last_name: string; email: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const html = layout(`
    <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">Account Update</h2>
    <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.7;">
      Dear <strong>${patient.first_name}</strong>,<br/>
      Your patient portal account has been deactivated. If you believe this is an error or
      need assistance, please contact the clinic directly.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:18px;">
      <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.6;">
        Your medical records remain safely stored. Access will be restored upon reactivation
        by Dr. El Hachem.
      </p>
    </div>

    ${divider()}
    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      Account email: <strong>${patient.email}</strong>
    </p>
  `);

  await resend.emails.send({
    from: FROM,
    to: patient.email,
    subject: 'Account Update — Dr. Saria El Hachem Patient Portal',
    html,
  });
}

// ─── 5. Patient → Account Reactivated ────────────────────────────────────────

export async function sendReactivationNotification(patient: {
  first_name: string; last_name: string; email: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const html = layout(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#dbeafe;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px;margin-bottom:12px;">🔓</div>
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">Account Reactivated</h2>
      <p style="margin:0;color:#6b7280;font-size:14px;">Your portal access has been restored</p>
    </div>

    <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.7;text-align:center;">
      Dear <strong>${patient.first_name}</strong>,<br/>
      Your patient portal account has been reactivated by Dr. El Hachem.
      You can now sign in and access your medical records again.
    </p>

    ${button('Sign In to Portal', `${PORTAL_URL}/login`, '#2563eb')}

    ${divider()}
    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      Account email: <strong>${patient.email}</strong>
    </p>
  `);

  await resend.emails.send({
    from: FROM,
    to: patient.email,
    subject: 'Account Reactivated — Dr. Saria El Hachem Patient Portal',
    html,
  });
}
