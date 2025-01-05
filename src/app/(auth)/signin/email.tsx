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

export const SigninCodeEmail = ({
  validationCode,
}: {
  validationCode: string;
}) => (
  <Html>
    <Head />
    <Preview>Tu código de Palaistra x PDI</Preview>
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
                width="200"
                height="200"
                alt="PDI"
                style={logo}
              />
            </Column>
          </Row>
        </Section>
        <Heading style={heading}>Tu código de Palaistra x PDI</Heading>
        <code style={code}>{validationCode}</code>
        <Text style={paragraph}>
          El código será válido por 15 minutos. Utiliza este código para iniciar
          sesión en Palaistra.
        </Text>
        <Hr style={hr} />
        <Link href="https://palaistra.com.pe" style={reportLink}>
          Palaistra LLC.
        </Link>
      </Container>
    </Body>
  </Html>
);

const title = { fontSize: '17px', fontWeight: 'bold' };

const logo = {
  borderRadius: 21,
  width: 180,
  height: 180,
  margin: '-55px -25px -40px -25px',
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

const code = {
  fontFamily: 'monospace',
  fontWeight: '700',
  padding: '1px 4px',
  backgroundColor: '#dfe1e4',
  letterSpacing: '-0.3px',
  fontSize: '21px',
  borderRadius: '4px',
  color: '#3c4149',
};
