import * as React from 'react';
import { Modal } from '@patternfly/react-core';
import './namespace-list.scss';

import { RouteComponentProps, Link } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import {
    EmptyState,
    EmptyStateIcon,
    Title,
    EmptyStateBody,
    EmptyStateVariant,
} from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';

import { ParamHelper } from '../../utilities/param-helper';
import {
    BaseHeader,
    NamespaceCard,
    Toolbar,
    Pagination,
    LoadingPageWithHeader,
} from '../../components';
import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { DataToolbar , DataToolbarItem, DataToolbarContent } from '@patternfly/react-core/dist/esm/experimental';
import { NamespaceAPI, NamespaceListType } from '../../api';
import { Paths, formatPath } from '../../paths';
import { Constants } from '../../constants';

interface IState {
    namespaces: NamespaceListType[];
    itemCount: number;
    params: {
        name?: string;
        sort?: string;
        page?: number;
        page_size?: number;
        tenant?: string;
    };
    hasPermission: boolean;
    isModalOpen: boolean;
    newNamespaceName: string;
    newNamespaceGroupIds: string;
}

interface IProps extends RouteComponentProps {
    title: string;
    namespacePath: Paths;
    filterOwner?: boolean;
}

export class NamespaceList extends React.Component<IProps, IState> {
    nonURLParams = ['tenant'];
    handleModalToggle;
    handleSubmit;
    handleChange;

    constructor(props) {
        super(props);

        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'page_size',
        ]);

        if (!params['page_size']) {
            params['page_size'] = 24;
        }

        this.state = {
            namespaces: undefined,
            itemCount: 0,
            params: params,
            hasPermission: true,
            isModalOpen: false,
            newNamespaceName: '',
            newNamespaceGroupIds: '',
        };

        this.handleModalToggle = () => {
          this.setState(({ isModalOpen }) => ({
            isModalOpen: !isModalOpen
          }));
        };

        this.handleChange = (event) => {
          const target = event.target
          const formInputName = target.name;
          this.setState({ [formInputName]: target.value });
        };

        this.handleSubmit = (event) => {
          console.log(this.state.newNamespaceName);
          console.log(this.state.newNamespaceGroupIds);
          let data: any = {
            "groups": [
                "demo",
                "system:partner-engineers"
            ],
            "name": "hakuna matata"
          }
          console.log(data);
          NamespaceAPI.create(data);
        };
    }

    componentDidMount() {
        if (this.props.filterOwner) {
            // Make a query with no params and see if it returns results to tell
            // if the user can edit namespaces
            NamespaceAPI.getMyNamespaces({}).then(results => {
                if (results.data.meta.count !== 0) {
                    this.loadNamespaces();
                } else {
                    this.setState({ hasPermission: false, namespaces: [] });
                }
            });
        } else {
            this.loadNamespaces();
        }
    }

    render() {
        const { namespaces, params, itemCount, hasPermission } = this.state;
        const { title, namespacePath } = this.props;
        const { isModalOpen } = this.state;

        if (!namespaces) {
            return <LoadingPageWithHeader></LoadingPageWithHeader>;
        }

        return (
            <React.Fragment>
                <BaseHeader title={title}>
                    <div className='toolbar'>
                        <Toolbar
                            params={params}
                            sortOptions={[{ title: 'Name', id: 'name' }]}
                            searchPlaceholder={'Search ' + title}
                            updateParams={p =>
                                this.updateParams(p, () =>
                                    this.loadNamespaces(),
                                )
                            }
                        />
                        <DataToolbarItem variant="separator" />
                        <DataToolbarItem>
                            <Button variant="primary"
                                    onClick={this.handleModalToggle}
                            >Create</Button>
                        </DataToolbarItem>
                        <div>
                            <Pagination
                                params={params}
                                updateParams={p =>
                                    this.updateParams(p, () =>
                                        this.loadNamespaces(),
                                    )
                                }
                                count={itemCount}
                                isCompact
                                perPageOptions={
                                    Constants.CARD_DEFAULT_PAGINATION_OPTIONS
                                }
                            />
                        </div>
                    </div>
                </BaseHeader>
                <Main>
                    {namespaces.length === 0 ? (
                        <Section>
                            <EmptyState
                                className='empty'
                                variant={EmptyStateVariant.full}
                            >
                                <EmptyStateIcon icon={WarningTriangleIcon} />
                                <Title headingLevel='h2' size='lg'>
                                    {hasPermission
                                        ? 'No matches'
                                        : 'No managed namespaces'}
                                </Title>
                                <EmptyStateBody>
                                    {hasPermission
                                        ? 'Please try adjusting your search query.'
                                        : 'This account is not set up to manage any namespaces.'}
                                </EmptyStateBody>
                            </EmptyState>
                        </Section>
                    ) : (
                        <Section className='card-layout'>
                            {namespaces.map((ns, i) => (
                                <div key={i} className='card-wrapper'>
                                    <Link
                                        to={formatPath(namespacePath, {
                                            namespace: ns.name,
                                        })}
                                    >
                                        <NamespaceCard
                                            key={i}
                                            {...ns}
                                        ></NamespaceCard>
                                    </Link>
                                </div>
                            ))}
                        </Section>
                    )}

                    <React.Fragment>
                        <Modal
                          isLarge
                          title="Create a new namespace"
                          isOpen={isModalOpen}
                          onClose={this.handleModalToggle}
                          actions={[
                            <Button key="confirm" variant="primary" onClick={this.handleSubmit}>
                              Confirm
                            </Button>,
                            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
                              Cancel
                            </Button>
                          ]}
                          isFooterLeftAligned
                        >
                            <form noValidate class="pf-c-form pf-m-horizontal">
                                <div class="pf-c-form__group">
                                    <label class="pf-c-form__label" for="horizontal-form-name">
                                        <span class="pf-c-form__label-text">Name</span>
                                        <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>
                                    </label>
                                    <div class="pf-c-form__horizontal-group">
                                        <input class="pf-c-form-control" required type="text" id="newNamespaceName" name="newNamespaceName" aria-describedby="horizontal-form-name-helper2" onChange={this.handleChange} />
                                        <p class="pf-c-form__helper-text" id="horizontal-form-name-helper2" aria-live="polite">Please provide your full name</p>
                                    </div>
                                </div>
                                <div class="pf-c-form__group">
                                    <label class="pf-c-form__label" for="horizontal-form-title">
                                        <span class="pf-c-form__label-text">Group</span>
                                    </label>
                                    <div class="pf-c-form__horizontal-group">
                                        <input class="pf-c-form-control" required type="text" id="newNamespaceGroupIds" name="newNamespaceGroupIds" aria-describedby="horizontal-form-name-helper2" onChange={this.handleChange} />
                                        <p class="pf-c-form__helper-text" id="horizontal-form-name-helper2" aria-live="polite">Please provide group identification numbers</p>
                                    </div>
                                </div>
                            </form>
                        </Modal>
                    </React.Fragment>
                </Main>
            </React.Fragment>
        );
    }

    private loadNamespaces() {
        let apiFunc: any;

        if (this.props.filterOwner) {
            apiFunc = p => NamespaceAPI.getMyNamespaces(p);
        } else {
            apiFunc = p => NamespaceAPI.list(p);
        }

        apiFunc(this.state.params).then(results => {
            this.setState({
                namespaces: results.data.data,
                itemCount: results.data.meta.count,
            });
        });
    }

    private get updateParams() {
        return ParamHelper.updateParamsMixin(this.nonURLParams);
    }
}
