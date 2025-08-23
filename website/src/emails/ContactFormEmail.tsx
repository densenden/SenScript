import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactFormEmail({
  name,
  email,
  subject,
  message,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.googleapis.com/css?family=Roboto:400,500',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>New contact form submission from {name}</Preview>
      <Section style={main}>
        <Section style={container}>
          <Heading style={h1}>🚀 New SenScript Contact Form Submission</Heading>
          
          <Section style={section}>
            <Text style={label}>From:</Text>
            <Text style={value}>{name}</Text>
            
            <Text style={label}>Email:</Text>
            <Text style={value}>{email}</Text>
            
            <Text style={label}>Subject:</Text>
            <Text style={value}>{subject}</Text>
            
            <Text style={label}>Message:</Text>
            <Text style={messageStyle}>{message}</Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button 
              style={button} 
              href={`mailto:${email}?subject=Re: ${subject}`}
            >
              Reply to {name}
            </Button>
          </Section>
          
          <Text style={footer}>
            This message was sent via the SenScript contact form.
          </Text>
        </Section>
      </Section>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Roboto, Verdana, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '12px',
  margin: '0 auto',
  padding: '20px',
  width: '580px',
};

const section = {
  padding: '24px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  margin: '16px 0',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '500',
  margin: '30px 0',
  padding: '0',
  lineHeight: '42px',
};

const label = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '12px 0 4px 0',
};

const value = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 16px 0',
  padding: '8px 12px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
};

const messageStyle = {
  color: '#1f2937',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
  padding: '12px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  whiteSpace: 'pre-wrap' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '24px 0',
};