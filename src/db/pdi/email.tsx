import * as React from 'react';

import {
  Body,
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

export const Welcome = ({ name, qr_url }: { name: string; qr_url: string }) => (
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
        <Heading style={heading}>
          ¡Bienvenidos a las Clases de Natación!
        </Heading>
        <Text style={paragraph}>Hola, {name}!</Text>
        <Text style={paragraph}>
          Nos complace anunciar que las clases de natación comenzarán el día de
          hoy, y estamos muy emocionados de contar con su participación.
        </Text>
        <Text style={paragraph}>
          Para asegurar un registro adecuado de asistencia, es obligatorio que
          traigan el código QR que se adjunta a este correo. Este código será
          utilizado para marcar su presencia al llegar a la piscina.
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
          2. Llévelo a cada clase de natación y muéstrelo a su profesor.
        </Text>
        <Text style={paragraph}>
          Recuerde que, sin el código QR, no podremos marcar su asistencia
          correctamente, por lo que es muy importante que lo tenga consigo al
          llegar.
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

Welcome.PreviewProps = {
  name: 'Anthony Cueva',
  qr_url: 'https://utfs.io/f/RYXHiEujQhFxR35cwrujQhFxkmLNv5AGpWcUErfqBn1g0Hsy',
};
export default Welcome;

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
