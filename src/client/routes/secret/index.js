import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import validator from 'validator';

import { Button, Group, Container, Textarea, TextInput, Stack, Title, Text } from '@mantine/core';
import {
    IconSquarePlus,
    IconDownload,
    IconLock,
    IconEye,
    IconPerspective,
    IconHeading,
} from '@tabler/icons';

import Error from '../../components/info/error';

import { getSecret, secretExists } from '../../api/secret';
import { downloadFile } from '../../api/upload';
import { getToken } from '../../helpers/token';

const Secret = () => {
    const { secretId, encryptionKey = null } = useParams();
    const [secret, setSecret] = useState(null);
    const [title, setTitle] = useState(null);
    const [preventBurn, setPreventBurn] = useState(null);
    const [isSecretOpen, setIsSecretOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isPasswordRequired, setIsPasswordRequired] = useState(false);
    const [file, setFile] = useState(null);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [error, setError] = useState(null);
    const [hasConvertedBase64ToPlain, setHasConvertedBase64ToPlain] = useState(false);

    const fetchSecret = async (event) => {
        event.preventDefault();

        if (isPasswordRequired && !password) {
            return;
        }

        if (secret) {
            setIsSecretOpen(true);

            return;
        }

        const json = await getSecret(secretId, encryptionKey, password);

        if (json.statusCode === 401) {
            setIsPasswordRequired(true);

            setError('Incorrect password!');

            return;
        }

        if (json.error) {
            setError(json.error);
        } else {
            setSecret(validator.unescape(json.secret));

            if (json.title) {
                setTitle(validator.unescape(json.title));
            }

            if (json.file) {
                setFile(json.file);
            }

            if (json.preventBurn) {
                setPreventBurn(json.preventBurn);
            }

            setIsSecretOpen(true);

            setError(null);
        }
    };

    useEffect(() => {
        (async () => {
            const response = await secretExists(secretId, password);

            if (response.statusCode === 401) {
                setIsPasswordRequired(true);

                return () => {};
            }

            if (response.error) {
                setError(response.error);
            }
        })();
        // eslint-disable-next-line
    }, [secretId]);

    const onPasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const onFileDownload = (event) => {
        event.preventDefault();

        downloadFile(
            {
                ...file,
                encryptionKey,
                secretId,
            },
            getToken()
        );

        if (!preventBurn) {
            setIsDownloaded(true);
        }
    };

    const convertBase64ToPlain = () => {
        setSecret(atob(secret));
        setHasConvertedBase64ToPlain(true);
    };

    return (
        <Container>
            <Stack>
                <Title order={1}>View your secret</Title>

                <Text>We will only show the secret once.</Text>

                {title && <TextInput icon={<IconHeading size={14} />} value={title} readOnly />}

                {isSecretOpen && (
                    <Textarea minRows={10} maxRows={30} value={secret} autosize readOnly />
                )}

                {isPasswordRequired && !isSecretOpen && (
                    <>
                        <Text>A password is required to open this secret</Text>

                        <TextInput
                            id="lemon-password"
                            icon={<IconLock size={14} />}
                            placeholder="Your password"
                            value={password}
                            onChange={onPasswordChange}
                            required
                            style={{ WebkitTextSecurity: 'disc' }}
                        />
                    </>
                )}

                <Group>
                    {!isSecretOpen && (
                        <Button
                            styles={() => ({
                                root: {
                                    backgroundColor: 'var(--color-contrast)',

                                    '&:hover': {
                                        backgroundColor: 'var(--color-contrast)',
                                        filter: 'brightness(115%)',
                                    },
                                },
                            })}
                            leftIcon={<IconEye size={14} />}
                            onClick={fetchSecret}
                        >
                            View the secret
                        </Button>
                    )}
                </Group>

                <Group position="right">
                    {isSecretOpen && (
                        <Button
                            styles={() => ({
                                root: {
                                    backgroundColor: 'var(--color-contrast)',

                                    '&:hover': {
                                        backgroundColor: 'var(--color-contrast)',
                                        filter: 'brightness(115%)',
                                    },
                                },
                            })}
                            leftIcon={<IconSquarePlus size={14} />}
                            component={Link}
                            to="/"
                        >
                            Create a new secret
                        </Button>
                    )}

                    {file && !isDownloaded && (
                        <Button
                            styles={() => ({
                                root: {
                                    backgroundColor: '#FF9769',

                                    '&:hover': {
                                        backgroundColor: '#FF9769',
                                        filter: 'brightness(115%)',
                                    },
                                },
                            })}
                            onClick={onFileDownload}
                            disabled={!secretId}
                            leftIcon={<IconDownload size={14} />}
                        >
                            Download the file
                        </Button>
                    )}

                    {isSecretOpen && (
                        <Button
                            styles={() => ({
                                root: {
                                    backgroundColor: '#FF9769',

                                    '&:hover': {
                                        backgroundColor: '#FF9769',
                                        filter: 'brightness(115%)',
                                    },
                                },
                            })}
                            leftIcon={<IconPerspective size={14} />}
                            onClick={convertBase64ToPlain}
                            disabled={hasConvertedBase64ToPlain}
                        >
                            Convert base64 to plain text
                        </Button>
                    )}
                </Group>
            </Stack>

            {error && <Error>{error}</Error>}
        </Container>
    );
};

export default Secret;
