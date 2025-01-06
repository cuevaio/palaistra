import * as React from 'react';

import {
  Body,
  CodeInline,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

export const WelcomeTeacher = ({
  name,
  qr_url,
}: {
  name: string;
  qr_url: string;
}) => (
  <Html>
    <Head />
    <Preview>Bienvenido</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Row>
            <Column>
              <Text style={title}>Palaistra</Text>
            </Column>
            <Column align="right">
              <Img
                src={'https://palaistra.com.pe/logo-pdi.jpg'}
                width="464"
                height="312"
                alt="PDI"
                style={logo}
              />
            </Column>
          </Row>
        </Section>
        <Heading style={heading}>¡Bienvenidos profesores!</Heading>

        <Text style={paragraph}>Hola, {name}!</Text>
        <Text style={paragraph}>
          A partir del 6 de enero, deberán traer el código QR adjunto para
          registrar su hora de llegada a las clases de natación. El código debe
          ser presentado al encargado de manera obligatoria al momento de
          ingresar a la piscina.
        </Text>

        <Img
          src={qr_url}
          width="300"
          height="300"
          alt="PDI"
          style={{ width: 300, height: 300, margin: 'auto' }}
        />
        <Text style={paragraph}>
          Instrucciones:
          <br />
          1. Imprima el QR o tómele una captura de pantalla.
          <br />
          2. Llévelo a cada clase.
        </Text>
        <Text style={paragraph}>
          Por defecto, la aplicación registrará su hora de llegada de la
          siguiente manera:
        </Text>
        <Text style={paragraph}>
          - <CodeInline style={{color: "green"}}>Puntual</CodeInline>: 10 minutos antes de la clase (hasta las
          12:50 p.m.)
          <br />- <CodeInline style={{color: "orange"}}>Tardanza</CodeInline>: Desde las 12:51 p.m. hasta la 12:55 p.m.
          <br />- <CodeInline style={{color: "red"}}>Sanción</CodeInline>: A partir de las 12:56 p.m. 
        </Text>
        <Text style={paragraph}>
          Recuerde que, sin el código QR, no podremos marcar su asistencia
          correctamente, por lo que es muy importante que lo tenga consigo al
          llegar.
        </Text>

        <Text style={paragraph}>
          Si deseas conocer más acerca de tu asistencia visita{' '}
          <Link href="https://pdi.palaistra.com.pe" style={{}}>
            nuestra página web
          </Link>{' '}
          (
          <Link href="https://pdi.palaistra.com.pe" style={{}}>
            https://pdi.palaistra.com.pe
          </Link>
          ) e inicia sesión con este correo electrónico.
        </Text>

        <Text style={paragraph}>
          Si tiene alguna pregunta o necesita más información, no dude en
          contactarnos.
        </Text>
        <Text style={{ ...paragraph, fontWeight: 'bold' }}>
          ¡Nos vemos en la piscina!
        </Text>

        <Hr style={hr} />
        <Link href="https://palaistra.com.pe" style={reportLink}>
          Palaistra LLC.
        </Link>
      </Container>
    </Body>
  </Html>
);

WelcomeTeacher.PreviewProps = {
  name: 'Sofia',
  qr_url: 'https://utfs.io/f/RYXHiEujQhFxR35cwrujQhFxkmLNv5AGpWcUErfqBn1g0Hsy',
};
export default WelcomeTeacher;

const title = { fontSize: '17px', fontWeight: 'bold' };

const logo = {
  width: 102,
  height: 77,
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
};

const paragraph = {
  margin: '15px 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
};

const reportLink = {
  fontSize: '14px',
  color: '#b4becc',
};

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
};
