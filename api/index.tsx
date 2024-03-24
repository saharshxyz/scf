import { Button, Frog } from 'frog';
import { handle } from 'frog/vercel';

import { NeynarAPIClient, isApiErrorResponse } from '@neynar/nodejs-sdk';
import { AxiosError } from 'axios';

import { createClient } from '@supabase/supabase-js';

import { config } from 'dotenv';
config();

export const supabase = createClient(
	process.env.SUPABASE_URL as string,
	process.env.SUPABASE_ANON_KEY as string
);

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);

export const app = new Frog({
	basePath: '/api',
});

app.frame('/', (c) => {
	return c.res({
		image: (
			<div
				style={{
					alignItems: 'center',
					background: 'rgb(220, 105, 71)',
					backgroundSize: '100% 100%',
					display: 'flex',
					flexDirection: 'column',
					flexWrap: 'nowrap',
					height: '100%',
					justifyContent: 'center',
					textAlign: 'center',
					width: '100%',
				}}
			>
				<div
					style={{
						color: 'white',
						fontSize: 60,
						fontStyle: 'normal',
						letterSpacing: '-0.025em',
						lineHeight: 1.4,
						marginTop: 30,
						padding: '0 120px',
						whiteSpace: 'pre-wrap',
					}}
				>
					{'Fantastic Day.'}
				</div>
			</div>
		),
		intents: [
			<Button.Link href='https://fantastic.day'>INFO</Button.Link>,
			<Button action='/info' value='info'>
				START
			</Button>,
		],
	});
});

app.frame('/info', (c) => {
	return c.res({
		image: (
			<div
				style={{
					alignItems: 'center',
					background: 'rgb(220, 105, 71)',
					backgroundSize: '100% 100%',
					display: 'flex',
					flexDirection: 'column',
					flexWrap: 'nowrap',
					height: '100%',
					justifyContent: 'center',
					textAlign: 'center',
					width: '100%',
					color: 'white',
				}}
			>
				<div
					style={{
						fontSize: '5em',
						fontStyle: 'normal',
						letterSpacing: '-0.025em',
						lineHeight: 1.4,
						marginTop: 30,
						padding: '0 120px',
						whiteSpace: 'pre-wrap',
					}}
				>
					{'How it Works?.'}
				</div>
				<div
					style={{
						fontSize: '2em',
					}}
				>
					{'Text on how the frame works, why user should sign up, etc.'}
				</div>
			</div>
		),
		intents: [
			<Button action='/final' value='final'>
				Join
			</Button>,
		],
	});
});

app.frame('/final', async (c) => {
	const { frameData, verified } = c;
	const frameDataString = JSON.stringify(frameData);
	const { fid } = JSON.parse(frameDataString);

	let user;

	try {
		const response = await client.lookupUserByFid(fid);
		user = response.result.user;

		if (user && user.username) {
			const { data, error } = await supabase
				.from('users')
				.upsert([{ fid, username: user.username, user }], {
					onConflict: 'fid',
				});

			if (error) {
				console.error('Supabase Error', error.message);
			} else {
				console.log('User added or already exists', data);
				console.log(user);

				return c.res({
					image: (
						<div
							style={{
								alignItems: 'center',
								background: 'rgb(220, 105, 71)',
								backgroundSize: '100% 100%',
								display: 'flex',
								flexDirection: 'column',
								flexWrap: 'nowrap',
								height: '100%',
								justifyContent: 'center',
								textAlign: 'center',
								width: '100%',
								color: 'white',
								fontSize: '3em',
							}}
						>
							<p>You're already signed up!</p>
						</div>
					),
					intents: [
						<Button.Link href='https://fantastic.day'>MINT</Button.Link>,
						<Button.Link href='https://fantastic.day'>
							Landing Page Link
						</Button.Link>,
					],
				});
			}
		}
	} catch (error) {
		if (isApiErrorResponse(error))
			console.log('API Error', error.response.data);
		else if (error instanceof AxiosError)
			console.log('Axios Error', error.message);
		else console.log('Generic Error', error);
	}

	return c.res({
		image: (
			<div
				style={{
					alignItems: 'center',
					background: 'rgb(220, 105, 71)',
					backgroundSize: '100% 100%',
					display: 'flex',
					flexDirection: 'column',
					flexWrap: 'nowrap',
					height: '100%',
					justifyContent: 'center',
					textAlign: 'center',
					width: '100%',
					color: 'white',
					fontSize: '3em',
				}}
			>
				<p>
					Thanks for signing up @{user ? user.username : 'undefined'}
					{verified ? '🟢' : '🔴'}
				</p>
			</div>
		),
		intents: [
			<Button.Link href='https://fantastic.day'>MINT</Button.Link>,
			<Button.Link href='https://fantastic.day'>Landing Page Link</Button.Link>,
		],
	});
});


export const GET = handle(app);
export const POST = handle(app);
