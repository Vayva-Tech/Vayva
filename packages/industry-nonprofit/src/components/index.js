/**
 * Nonprofit Industry Components
 */

export class DonationTracker {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `
      <div class="donation-tracker">
        <h2>Donation Tracker</h2>
        <div class="donation-stats">
          <div class="stat-card">
            <h3>Total Donations</h3>
            <p>$125,430</p>
          </div>
          <div class="stat-card">
            <h3>Monthly Goal</h3>
            <p>$25,000</p>
          </div>
          <div class="stat-card">
            <h3>Donors</h3>
            <p>1,247</p>
          </div>
        </div>
        <div class="recent-donations">
          <h3>Recent Donations</h3>
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Smith</td>
                <td>$500</td>
                <td>2024-01-15</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

export class GrantPipelineDashboard {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `
      <div class="grant-pipeline-dashboard">
        <h2>Grant Pipeline Dashboard</h2>
        <div class="pipeline-stages">
          <div class="stage">
            <h3>Research</h3>
            <p>12 grants</p>
          </div>
          <div class="stage">
            <h3>Writing</h3>
            <p>8 grants</p>
          </div>
          <div class="stage">
            <h3>Submitted</h3>
            <p>15 grants</p>
          </div>
          <div class="stage">
            <h3>Funded</h3>
            <p>5 grants</p>
          </div>
        </div>
        <div class="upcoming-deadlines">
          <h3>Upcoming Deadlines</h3>
          <ul>
            <li>Foundation Grant - Jan 30, 2024</li>
            <li>Community Fund - Feb 15, 2024</li>
          </ul>
        </div>
      </div>
    `;
  }
}

// Export types
export const DonationTrackerProps = {};
export const GrantPipelineDashboardProps = {};