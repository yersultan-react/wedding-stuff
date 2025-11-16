import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend('re_J9K8pDEp_Ho3t6ZehdNzoAfpXd1DobFXT');

export async function POST(request: Request) {
  const data = await request.json();
  
  try {
    await resend.emails.send({
      from: 'wedding@resend.dev',
      to: 'mobilelegendsakk1@gmail.com',
      subject: `Жаңа қонақ: ${data.name}`,
      html: `
        <h2>Тойдан жаңа хабар</h2>
  <p><strong>Аты-жөні:</strong> ${data.name}</p>
  <p><strong>Келу жағдайы:</strong> ${data.attendance === 'yes' ? 'Иә, барамын' : data.attendance === 'maybe' ? 'Жұбайыммен барамын' : 'Келе алмаймын'}</p>
  <p><strong>Тілегі:</strong> ${data.message}</p>
  <p><strong>Жіберілген уақыты:</strong> ${data.date}</p>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}