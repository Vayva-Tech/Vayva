# VAYVA Workflow Builder Guide

## Overview

The VAYVA Workflow Builder is a visual workflow automation system that allows merchants to create custom business processes without writing code. It provides drag-and-drop functionality with industry-specific templates and nodes.

## Key Features

### Visual Builder
- Drag-and-drop interface for creating workflows
- Real-time validation and error checking
- Industry-specific node palettes
- Live preview of workflow execution

### Industry Templates
Pre-built workflows for various industries:
- **Fashion**: Auto-reorder low sizes, seasonal inventory alerts
- **Restaurant**: Table reservation automation, kitchen order management
- **Healthcare**: Patient appointment reminders, medication refill alerts
- **Real Estate**: Property showing scheduler, lead follow-up sequences

### Node Types

#### Logic Nodes
- **Condition**: Make decisions based on data
- **Delay**: Wait for specific time periods
- **Split/Merge**: Handle parallel processing
- **Loop**: Repeat actions

#### Action Nodes
- **Send Email/SMS**: Communicate with customers
- **Update Inventory**: Modify stock levels
- **Create Task**: Generate work items
- **Apply Discount**: Create promotional offers

#### Industry-Specific Nodes
- **Fashion Size Alert**: Monitor specific size inventory
- **Restaurant 86 Item**: Remove menu items
- **Healthcare Reminder**: Patient notifications
- **Real Estate Scheduler**: Property showing coordination

## Getting Started

### 1. Access the Workflow Builder
Navigate to the Workflows section in your merchant dashboard:
```
Dashboard → Automation → Workflows
```

### 2. Create a New Workflow
Click "Create Workflow" and choose:
- Start from scratch
- Use a template
- Import existing workflow

### 3. Build Your Workflow

#### Add Trigger
Every workflow starts with a trigger:
- **Schedule**: Run at specific times
- **Order Events**: When orders are created/paid/cancelled
- **Inventory Changes**: When stock levels change
- **Customer Actions**: When customers join/leave segments

#### Add Actions
Drag nodes from the palette onto the canvas and connect them with edges.

#### Configure Nodes
Click on any node to configure its properties in the right panel.

### 4. Test and Deploy
- Click "Validate" to check for errors
- Use "Test" to run with sample data
- Activate to start processing real events

## Best Practices

### Workflow Design
1. **Start Simple**: Begin with basic linear workflows
2. **Use Descriptive Names**: Clear labels help with maintenance
3. **Add Error Handling**: Include fallback paths for failures
4. **Monitor Performance**: Check execution logs regularly

### Industry Tips

#### Fashion
- Set appropriate thresholds for size-specific alerts
- Consider seasonal variations in reorder points
- Use customer segmentation for targeted campaigns

#### Restaurant
- Account for kitchen capacity in scheduling
- Set appropriate timing for table turnover
- Coordinate with staff availability

#### Healthcare
- Respect patient privacy regulations
- Allow adequate time for appointment preparation
- Include backup communication methods

#### Real Estate
- Consider timezone differences for notifications
- Allow buffer time between showings
- Track lead source effectiveness

## API Reference

### Workflow Structure
```typescript
interface Workflow {
  id: string;
  name: string;
  industry: IndustrySlug;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'draft' | 'active' | 'paused' | 'archived';
}
```

### Execution Monitoring
```bash
GET /api/workflows/{id}/executions
GET /api/workflows/{id}/executions/{executionId}
GET /api/workflows/{id}/logs
```

## Troubleshooting

### Common Issues

**Workflow Not Triggering**
- Check trigger configuration
- Verify workflow status is "active"
- Review execution logs for errors

**Nodes Not Executing**
- Ensure all required connections are made
- Check node configuration parameters
- Validate data types match expectations

**Performance Problems**
- Limit workflow complexity
- Use appropriate delays between actions
- Monitor execution frequency

### Support Resources
- [Documentation Portal](https://docs.vayva.com/workflows)
- [Community Forum](https://community.vayva.com)
- [Support Tickets](mailto:support@vayva.com)

## Advanced Features

### Variables and Expressions
Use `${variable}` syntax to reference data:
```
Welcome ${customer.firstName}!
Your order #${order.id} is ready.
```

### Conditional Logic
Create branching workflows based on data:
```
IF order.total > 100 THEN apply_discount
ELSE send_standard_confirmation
```

### Scheduled Workflows
Use cron expressions for complex scheduling:
```
0 9 * * 1-5    # Weekdays at 9 AM
0 0 1 * *      # First day of month
*/30 * * * *   # Every 30 minutes
```

---

*Last Updated: March 2026*
*Version: 1.0*