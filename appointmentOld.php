<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</head>

<style>
 html, body {
        -webkit-text-size-adjust: 100%;
        font-family: Arial;
    }

    @media screen and (-webkit-min-device-pixel-ratio: 3) {
        body {
            font-size: 13px;
        }
    }

  @media print {
    body {
      margin: 0;
      padding: 12px;
      font-family: 'Arial', sans-serif;
    }

    .no-print {
      display: none;
    }
  }

  body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 12px;
    background: white;
  }

  .appointment-container {
    max-width: 650px;
    margin: 0 auto;
  }

  /* Type Scale - Base: 8px */
  .text-h1 {
    font-size: 13px;
    font-weight: bold;
  }

  /* 1.6x base */
  .text-h2 {
    font-size: 11px;
    font-weight: bold;
  }

  /* 1.4x base */
  .text-h3 {
    font-size: 9px;
    font-weight: bold;
  }

  /* 1.1x base */
  .text-body {
    font-size: 8px;
  }

  /* base */
  .text-small {
    font-size: 6px;
  }

  /* 0.8x base */
  /* Spacing Scale - Base: 4px (use 4, 8, 12, 16, 20) */

  .appointment-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #00a59e;
  }

  .appointment-title {
    font-size: 13px;
    font-weight: bold;
    color: #00a59e;
    margin-bottom: 4px;
  }

  .appointment-number {
    font-size: 9px;
    color: #69717D;
    font-weight: 500;
  }

  .appointment-date {
    font-size: 6px;
    color: #69717D;
    margin-top: 4px;
  }

  .info-section {
    margin-bottom: 20px;
  }

  .info-card {
    background: #F4F4F5;
    padding: 12px;
    border-radius: 6px;
    border-left: 3px solid #00a59e;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .info-label {
    color: #69717D;
    font-weight: 500;
    font-size: 8px;
  }

  .info-value {
    color: #11181C;
    font-weight: 600;
    font-size: 8px;
  }

  .clinic-section {
    margin-bottom: 20px;
  }

  .clinic-title {
    font-size: 11px;
    font-weight: bold;
    color: #00a59e;
    margin-bottom: 8px;
  }

  .clinic-info {
    background: #F4F4F5;
    padding: 12px;
    border-radius: 6px;
    border-left: 3px solid #00a59e;
  }

  .clinic-name {
    font-size: 9px;
    font-weight: bold;
    color: #11181C;
    margin-bottom: 4px;
  }

  .clinic-details {
    font-size: 6px;
    color: #69717D;
    line-height: 1.4;
  }

  .patient-section {
    margin-bottom: 20px;
  }

  .patient-title {
    font-size: 11px;
    font-weight: bold;
    color: #00a59e;
    margin-bottom: 8px;
  }

  .patient-info {
    background: #F4F4F5;
    padding: 12px;
    border-radius: 6px;
    border-left: 3px solid #00a59e;
  }

  .patient-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .appointment-details-section {
    margin-bottom: 20px;
  }

  .appointment-details-title {
    font-size: 11px;
    font-weight: bold;
    color: #00a59e;
    margin-bottom: 8px;
  }

  .appointment-details-info {
    background: #F4F4F5;
    padding: 12px;
    border-radius: 6px;
    border-left: 3px solid #00a59e;
  }

  .appointment-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .status-badge {
    text-align: center;
    margin-top: 12px;
    padding: 8px;
    border-radius: 16px;
    font-weight: bold;
    font-size: 6px;
  }

  .status-scheduled {
    background: #E3F2FD;
    color: #1976D2;
    border: 2px solid #2196F3;
  }

  .status-checked-in {
    background: #E8F5E8;
    color: #2E7D32;
    border: 2px solid #4CAF50;
  }

  .status-in-progress {
    background: #FFF3E0;
    color: #F57C00;
    border: 2px solid #FF9800;
  }

  .status-completed {
    background: #E8F5E8;
    color: #2E7D32;
    border: 2px solid #4CAF50;
  }

  .status-cancelled {
    background: #FFEBEE;
    color: #C62828;
    border: 2px solid #F44336;
  }

  .notes-section {
    background: #F4F4F5;
    padding: 12px;
    border-radius: 6px;
    border-left: 3px solid #00a59e;
    margin-top: 12px;
  }

  .notes-title {
    font-size: 9px;
    font-weight: bold;
    color: #00a59e;
    margin-bottom: 8px;
  }

  .notes-content {
    color: #11181C;
    line-height: 1.4;
    font-size: 8px;
  }
</style>

<div class="appointment-container">
  <div
    style="background: white; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px;">

    <!-- Patient Information -->
    <div style="margin-bottom: 20px;">
              <h3 style="font-size: 11px; font-weight: bold; color: #00a59e; margin: 0 0 8px 0;">Patient Information</h3>
      <div style="background: #F4F4F5; padding: 12px; border-radius: 6px; border-left: 3px solid #00a59e;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 12px;">
          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Name:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px;"><?= $appointment['patient'] ? $appointment['patient']['full_name'] : "" ?></span>
          </div>

          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Gender:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px;"><?= $appointment['patient'] ? $appointment['patient']['gender'] : "" ?></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Phone:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px;"><?= $appointment['patient'] ? $appointment['patient']['contact_number'] : "" ?></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Email:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px;"><?= $appointment['patient'] ? $appointment['patient']['user']['email'] : "" ?></span>
          </div>

        </div>
        <div style="margin-top: 8px;">
          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Address:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px;"><?= $appointment['patient'] ? $appointment['patient']['address'] : "" ?></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Details -->
    <div style="margin-bottom: 20px;">
              <h3 style="font-size: 11px; font-weight: bold; color: #00a59e; margin: 0 0 8px 0;">Appointment Details</h3>
      <div style="background: #F4F4F5; padding: 12px; border-radius: 6px; border-left: 3px solid #00a59e;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 12px;">
          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Appointment ID:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px; text-align: end;"><?= $appointment['appointment_number'] ?></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Doctor:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px;"><?= $appointment['doctor'] ? $appointment['doctor']['username'] : "" ?></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Date:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px;"><?= $appointment['appointment_date'] ?></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Time:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px;"><?= $appointment['appointment_time'] ?></span>
          </div>
          <!-- <div style="display: flex; justify-content: space-between; margin: 0;">
              <span style="color: #69717D; font-weight: 500; font-size: 8px;">Duration:</span>
              <span style="color: #11181C; font-weight: 600; font-size: 8px;">60 minutes</span>
            </div> -->
          <div style="display: flex; justify-content: space-between; margin: 0;">
            <span style="color: #69717D; font-weight: 500; font-size: 8px;">Status:</span>
            <span style="color: #11181C; font-weight: 600; font-size: 8px;"><?= $appointment['status'] ?></span>
          </div>
        </div>
        <!-- <div
            style="text-align: center; margin-top: 12px; padding: 8px; border-radius: 16px; font-weight: bold; font-size: 10px; background: #E3F2FD; color: #1976D2; border: 2px solid #2196F3;">
            📅 SCHEDULED
          </div> -->
      </div>
    </div>



    <!-- Medical History & Allergies -->
    <!-- <div style="margin-bottom: 20px;">
        <h3 style="font-size: 11px; font-weight: bold; color: #00a59e; margin: 0 0 8px 0;">Medical Information</h3>
        <div
          style="background: #F4F4F5; padding: 12px; border-radius: 6px; border-left: 3px solid #00a59e; display: flex; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; margin: 0; gap: 1rem;">
              <span style="color: #69717D; font-weight: 500; font-size: 8px;">Medical History:</span>
              <span style="color: #11181C; font-weight: 600; font-size: 8px;">Diabetes Type 2, Hypertension</span>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; margin: 0; gap: 1rem;">
              <span style="color: #69717D; font-weight: 500; font-size: 8px;">Allergies:</span>
              <span style="color: #11181C; font-weight: 600; font-size: 8px;">Penicillin, Latex</span>
            </div>
          </div>
        </div>
      </div> -->

    <!-- Notes Section -->
    <!-- <div style="background: #F4F4F5; padding: 12px; border-radius: 6px; border-left: 3px solid #00a59e;">
        <h3 style="font-size: 9px; font-weight: bold; color: #00a59e; margin: 0 0 8px 0;">Notes</h3>
        <p style="color: #11181C; line-height: 1.4; font-size: 8px; margin: 0;">Please arrive 15 minutes before your
          scheduled appointment time. Bring your insurance card and any relevant medical records. If you need to
          reschedule, please call at least 24 hours in advance.</p>
      </div> -->
  </div>
</div>