import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmationEmail = async (order) => {
  try {
    const templateId = process.env.RESEND_TEMPLATE_ORDER_CONFIRMED;
    if (!templateId) {
      console.warn('RESEND_TEMPLATE_ORDER_CONFIRMED is not set in .env');
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Orders <onboarding@resend.dev>',
      to: order.customer.email,
      subject: `Order Confirmed - ${order.id}`,
      template: {
        id: templateId,
        variables: {
          orderId: order.id,
          customerName: order.customer.name,
          orderItemsList: order.items.map(item => `- ${item.quantity || 1}x ${item.name || 'Item'} (Size: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'})`).join('\n'),
          orderTotal: `₹${order.total}`,
          totalAmount: order.total,
          finalAmount: order.total, // Passing both to ensure it catches
          date: new Date().toLocaleDateString(),
          orderDate: new Date().toLocaleDateString()
        }
      }
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
    } else {
      console.log('Confirmation email sent successfully:', data);
    }
  } catch (err) {
    console.error('Failed to send confirmation email via Resend:', err);
  }
};

export const sendOrderShippedEmail = async (order) => {
  try {
    const templateId = process.env.RESEND_TEMPLATE_ORDER_SHIPPED;
    if (!templateId) {
      console.warn('RESEND_TEMPLATE_ORDER_SHIPPED is not set in .env');
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Orders <onboarding@resend.dev>', // Change this to your verified domain later
      to: order.customer.email,
      subject: `Your Order ${order.id} has shipped!`,
      template: {
        id: templateId,
        variables: {
          customerName: order.customer.name,
          trackingNumber: order.trackingNumber || 'Pending',
          shippingCarrier: order.shippingCarrier || 'Standard Delivery',
          trackingLink: order.trackingLink || '#',
          shippedItemsList: order.items.map(item => `- ${item.quantity || 1}x ${item.name || 'Item'} (Size: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'})`).join('\n'),
          storeWebsiteUrl: 'http://localhost:5173',
          supportEmail: 'support@supremeit.com'
        }
      }
    });

    if (error) {
      console.error('Error sending shipping email:', error);
    } else {
      console.log('Shipping email sent successfully:', data);
    }
  } catch (err) {
    console.error('Failed to send shipping email via Resend:', err);
  }
};
