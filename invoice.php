<style>
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

  .invoice-container {
    max-width: 650px;
    margin: 0 auto;
  }

  /* Type Scale - Reduced sizes (Base: 10px instead of 12px) */
  .text-h1 {
    font-size: 16px;
    font-weight: bold;
  }

  /* 1.6x base */
  .text-h2 {
    font-size: 14px;
    font-weight: bold;
  }

  /* 1.4x base */
  .text-h3 {
    font-size: 12px;
    font-weight: bold;
  }

  /* 1.2x base */
  .text-body {
    font-size: 10px;
  }

  /* base */
  .text-small {
    font-size: 8px;
  }

  /* Spacing Scale - Base: 4px (unchanged) */

  .invoice-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #00a59e;
  }

  .invoice-title {
    font-size: 16px;
    font-weight: bold;
    color: #00a59e;
    margin-bottom: 4px;
  }

  .invoice-number {
    font-size: 12px;
    color: #69717d;
    font-weight: 500;
  }

  .invoice-date {
    font-size: 8px;
    color: #69717d;
    margin-top: 4px;
  }

  .info-section {
    margin-bottom: 20px;
  }

  .info-card {
    background: #f4f4f5;
    padding: 12px;
    border-radius: 6px;
    border-left: 3px solid #00a59e;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .info-label {
    color: #69717d;
    font-weight: 500;
    font-size: 10px;
  }

  .info-value {
    color: #11181c;
    font-weight: 600;
    font-size: 10px;
  }

  .items-section {
    margin-bottom: 20px;
  }

  .items-title {
    font-size: 14px;
    font-weight: bold;
    color: #00a59e;
    margin-bottom: 8px;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .items-table th {
    background: #00a59e;
    color: white;
    padding: 8px 8px;
    text-align: left;
    font-weight: 600;
    font-size: 8px;
  }

  .items-table td {
    padding: 8px;
    border-bottom: 1px solid #e4e7eb;
    font-size: 8px;
  }

  .items-table tr:nth-child(even) {
    background: #f4f4f5;
  }

  .items-table tr:hover {
    background: #e4e7eb;
  }

  .total-column {
    font-weight: bold;
    color: #00a59e;
  }

  .financial-summary {
    background: #f4f4f5;
    padding: 16px;
    border-radius: 8px;
    border: 2px solid #00a59e;
  }

  .financial-title {
    font-size: 14px;
    font-weight: bold;
    color: #00a59e;
    margin-bottom: 12px;
    text-align: center;
  }

  .financial-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .financial-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 10px;
  }

  .financial-label {
    color: #11181c;
    font-weight: 600;
  }

  .financial-value {
    font-weight: bold;
  }

  .subtotal {
    color: #11181c;
  }

  .discount {
    color: #f31260;
  }

  .net-amount {
    color: #00a59e;
  }

  .paid {
    color: #17c964;
  }

  .balance {
    color: #f5a524;
  }

  .status-badge {
    text-align: center;
    margin-top: 12px;
    padding: 8px;
    border-radius: 16px;
    font-weight: bold;
    font-size: 8px;
  }

  .status-paid {
    background: #f0fdf4;
    color: #166534;
    border: 2px solid #22c55e;
  }

  .status-pending {
    background: #fffbeb;
    color: #92400e;
    border: 2px solid #f59e0b;
  }

  .notes-section {
    background: #f4f4f5;
    padding: 12px;
    border-radius: 6px;
    border-left: 3px solid #00a59e;
    margin-top: 12px;
  }

  .notes-title {
    font-size: 12px;
    font-weight: bold;
    color: #00a59e;
    margin-bottom: 8px;
  }

  .notes-content {
    color: #11181c;
    line-height: 1.4;
    font-size: 10px;
  }
</style>

<div class="invoice-container">
  <div
    style="
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      padding-top: 0 20px;
    "
  >

    <!-- Invoice Header -->
    <div style="text-align: center; border-bottom: 2px solid #00a59e; margin-bottom: 20px;">
      <h2 style="font-size: 16px; font-weight: bold; color: #00a59e;">Clinic Name</h2>
    </div>

    <!-- Invoice Information -->
    <div style="margin-bottom: 10px">
      <div
        style="
          background: #f4f4f5;
          padding: 16px;
          border-radius: 6px;
          border-left: 3px solid #00a59e;
        "
      >
        <div
          style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          "
        >
          <div style="display: flex; margin: 0">
            <span style="color: #69717d; font-weight: 500; font-size: 10px"
              >Name:</span
            >
            <span style="color: #11181c; font-weight: 600; font-size: 10px"
              ><?= htmlspecialchars($invoice['patient']['user']['username']) ?></span
            >
          </div>
          <div style="display: flex; justify-content: end; margin: 0">
            <span style="color: #69717d; font-weight: 500; font-size: 10px"
              >MRN:</span
            >
            <span style="color: #11181c; font-weight: 600; font-size: 10px"
              ><?= htmlspecialchars($invoice['patient']['mrn_number']) ?></span
            >
          </div>
          <div style="display: flex; margin: 0">
            <span style="color: #69717d; font-weight: 500; font-size: 10px"
              >Contact:</span
            >
            <span style="color: #11181c; font-weight: 600; font-size: 10px"
              ><?= htmlspecialchars($invoice['patient']['contact_number']) ?></span
            >
          </div>
          <div style="display: flex; justify-content: end; margin: 0">
            <span style="color: #69717d; font-weight: 500; font-size: 10px"
              >Invoice No: </span
            >
            <span style="color: #11181c; font-weight: 600; font-size: 10px"
              ><?= htmlspecialchars($invoice['invoice_number']) ?></span
            >
          </div>
          <div style="display: flex; margin: 0">
            <span style="color: #69717d; font-weight: 500; font-size: 10px"
              >Doctor:</span
            >
            <span style="color: #11181c; font-weight: 600; font-size: 10px"
              ><?= htmlspecialchars($invoice['doctor']['username']) ?></span
            >
          </div>
          <div style="display: flex; justify-content: end; margin: 0">
            <span style="color: #69717d; font-weight: 500; font-size: 10px"
              >Date: </span
            >
            <span
              style="
                color: #11181c;
                font-weight: 600;
                font-size: 10px;
                text-transform: capitalize;
              "
              ><?= htmlspecialchars($invoice['invoice_date']) ?></span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Items -->
    <div style="margin-bottom: 20px">
      <div
        style="
          background: white;
          border: 1px solid #e4e7eb;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        "
      >
        <table style="width: 100%; border-collapse: collapse">
          <thead style="background: #00a59e; color: white">
            <tr>
              <th
                style="
                  padding: 8px 8px;
                  text-align: left;
                  font-weight: 600;
                  font-size: 8px;
                "
              >
                #
              </th>
              <th
                style="
                  padding: 8px 8px;
                  text-align: left;
                  font-weight: 600;
                  font-size: 8px;
                "
              >
                Description
              </th>
              <th
                style="
                  padding: 8px 8px;
                  text-align: left;
                  font-weight: 600;
                  font-size: 8px;
                "
              >
                Qty
              </th>
              <th
                style="
                  padding: 8px 8px;
                  text-align: left;
                  font-weight: 600;
                  font-size: 8px;
                "
              >
                Price
              </th>
              <th
                style="
                  padding: 8px 8px;
                  text-align: left;
                  font-weight: 600;
                  font-size: 8px;
                "
              >
                Disc.
              </th>
              <th
                style="
                  padding: 8px 8px;
                  text-align: left;
                  font-weight: 600;
                  font-size: 8px;
                "
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody style="border-top: 1px solid #e4e7eb">
            <?php $i = 1; ?>
            <?php foreach ($invoice['items'] as $item): ?>
              <tr style="background: white">
                <td
                  style="
                    padding: 8px;
                    border-bottom: 1px solid #e4e7eb;
                    font-size: 8px;
                    color: #11181c;
                    font-weight: 500;
                  "
                >
                  <?= $i ?>
                </td>
                <td
                  style="
                    padding: 8px;
                    border-bottom: 1px solid #e4e7eb;
                    font-size: 8px;
                    color: #11181c;
                  "
                >
                  <?= htmlspecialchars($item['item_description']) ?>
                </td>
                <td
                  style="
                    padding: 8px;
                    border-bottom: 1px solid #e4e7eb;
                    font-size: 8px;
                    color: #11181c;
                  "
                >
                  <?= htmlspecialchars($item['quantity']) ?>
                </td>
                <td
                  style="
                    padding: 8px;
                    border-bottom: 1px solid #e4e7eb;
                    font-size: 8px;
                    color: #11181c;
                  "
                >
                  PKR <?= number_format($item['unit_price'], 2) ?>
                </td>
                <td
                  style="
                    padding: 8px;
                    border-bottom: 1px solid #e4e7eb;
                    font-size: 8px;
                    color: #11181c;
                  "
                >
                  PKR <?= number_format($item['discount'], 2) ?>
                </td>
                <td
                  style="
                    padding: 8px;
                    border-bottom: 1px solid #e4e7eb;
                    font-size: 8px;
                    color: #00a59e;
                    font-weight: bold;
                  "
                >
                  PKR <?= number_format($item['total_price'], 2) ?>
                </td>
              </tr>
              <?php $i++; ?>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Financial Summary -->
    <div
      style="
        background: #f4f4f5;
        padding: 16px;
        border-radius: 8px;
        border: 2px solid #00a59e;
        margin-bottom: 20px;
      "
    >
      <div style="display: grid; grid-template-columns: 1fr; gap: 5px">
        <div style="display: flex; justify-content: space-between; gap: 12px">
          <div style="display: flex; font-size: 9px">
            <span style="color: #11181c; font-weight: 600">Subtotal:</span>
            <span style="color: #11181c; font-weight: bold; font-size: 9px">
              <?= htmlspecialchars($invoice['total_amount']) ?></span
            >
          </div>
          <div style="display: flex; font-size: 9px">
            <span style="color: #11181c; font-weight: 600">Discount:</span>
            <span style="color: #11181c; font-weight: bold; font-size: 9px">
              <?= htmlspecialchars($invoice['discount_amount']) ?></span
            >
          </div>
          <div style="display: flex; font-size: 9px">
            <span style="color: #11181c; font-weight: 600"
              >Total:</span
            >
            <span style="color: #11181c; font-weight: bold; font-size: 9px">
              <?= htmlspecialchars($invoice['net_amount']) ?></span
            >
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; gap: 12px">
          <div style="display: flex; font-size: 9px">
            <span style="color: #11181c; font-weight: 600"
              >Amount Paid:</span
            >
            <span style="color: #11181c; font-weight: bold; font-size: 9px">
              <?= htmlspecialchars($invoice['paid']) ?></span
            >
          </div>
          <div style="display: flex; font-size: 9px">
            <span style="color: #11181c; font-weight: 600">Balance:</span>
            <span style="color: #11181c; font-weight: bold; font-size: 9px">
              PKR 0.00</span
            >
          </div>
        </div>
        <div style="border-top: 1px solid #e4e7eb">
          <div style="text-align: right; margin-top: 8px">
            <div
              style="
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 7px;
                text-transform: uppercase;
                letter-spacing: 1px;
                border: 2px dashed;
                color: #166534;
                border-color: #22c55e;
              "
            >
              ✅ PAID (<?= htmlspecialchars($invoice['payment_method']) ?>)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>