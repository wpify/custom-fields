// The post / multi_post pickers show the WooCommerce SKU next to the product
// name, both in the dropdown and in the preview of an already selected post.
// The REST transport is mocked so the components can be exercised in jsdom.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../support/providers';
import { PostSelect } from '@/components/PostSelect';
import { PostPreview } from '@/fields/Post';
import { get } from '@/helpers/api.js';

jest.mock( '@/helpers/api.js', () => ( {
	get: jest.fn(),
	post: jest.fn(),
} ) );

const product = {
	id: 11,
	title: 'Blue Shirt',
	post_type: 'product',
	post_status: 'publish',
	permalink: 'https://example.com/blue-shirt',
	thumbnail: '',
	excerpt: 'A blue shirt',
	sku: 'TS-BLU-01',
};

const plainPost = { ...product, id: 12, title: 'Announcement', post_type: 'post', sku: '' };

const openMenu = async ( container ) => {
	const user = userEvent.setup();
	await user.click( container.querySelector( '.wpifycf-select__control' ) );
};

describe( 'PostSelect SKU display', () => {
	beforeEach( () => {
		get.mockReset();
	} );

	it( 'renders the SKU next to the product name in the dropdown', async () => {
		get.mockResolvedValue( [ product ] );

		const { container } = renderWithProviders(
			<PostSelect postType="product" value={ null } onChange={ () => {} } />,
			{ config: { api_path: '/wpifycf/v1' } }
		);

		await openMenu( container );

		expect( await screen.findByText( 'Blue Shirt' ) ).toBeInTheDocument();
		expect( screen.getByText( 'SKU: TS-BLU-01' ) ).toBeInTheDocument();
	} );

	it( 'renders no SKU element for a post without one', async () => {
		get.mockResolvedValue( [ plainPost ] );

		const { container } = renderWithProviders(
			<PostSelect postType="post" value={ null } onChange={ () => {} } />,
			{ config: { api_path: '/wpifycf/v1' } }
		);

		await openMenu( container );

		expect( await screen.findByText( 'Announcement' ) ).toBeInTheDocument();
		expect( container.querySelector( '.wpifycf-post-sku' ) ).toBeNull();
	} );
} );

describe( 'PostPreview SKU display', () => {
	it( 'appends the SKU to the title line', () => {
		render( <PostPreview post={ product } onDelete={ () => {} } /> );

		expect( screen.getByText( 'SKU: TS-BLU-01' ) ).toBeInTheDocument();
		expect( screen.getByText( /Blue Shirt/ ) ).toBeInTheDocument();
	} );

	it( 'renders nothing extra for a post without a SKU', () => {
		const { container } = render( <PostPreview post={ plainPost } onDelete={ () => {} } /> );

		expect( container.querySelector( '.wpifycf-post-sku' ) ).toBeNull();
	} );
} );
