import * as React from 'react';
import { Modal } from '@patternfly/react-core';
import { Form, FormGroup, ActionGroup } from '@patternfly/react-core';
import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';

interface IProps {
  isOpen: boolean;
}

interface IState {
  newNamespaceName: string;
  newNamespaceGroupIds: string;
}

export class NamespaceModal extends React.Component<IProps, IState> {
  handleSubmit;

  constructor(props) {

    super(props);

    this.state = {
      newNamespaceName: '',
      newNamespaceGroupIds: '',
    }

    this.handleSubmit = (event) => {
      let data: any = {
        "name": this.state.newNamespaceName,
        "groups": [
            "system:partner-engineers"
        ],
      };
      NamespaceAPI.createNamespace(data).then(results => {
        console.log(results);
        if (results.status == 201) {
          // TODO:
          //   alerts: this.state.alerts.concat({
          //       variant: 'success',
          //       title: `Namespace created successfully .`,
          //   })
          this.loadNamespaces();
        } else {
          // TODO:
          //   alerts: this.state.alerts.concat({
          //       variant: 'danger',
          //       title: `API Error: ${error.response.status}`,
          //       description:
          //           `Could not create the namespace.`,
          //   })
        }
      });
      this.handleModalToggle();
      this.setState({ newNamespaceName: '' });
      this.setState({ newNamespaceGroupIds: '' });
    };

    render() {
      <React.Fragment>
        <Modal
          isLarge
          title="Create a new namespace"
          isOpen={this.props.isOpen}
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
            <Form>
                <FormGroup
                  label="Name"
                  isRequired
                  fieldId="simple-form-name"
                  helperText="Please provide the namespace name"
                >
                    <TextInput
                      isRequired
                      type="text"
                      id="newNamespaceName"
                      name="newNamespaceName"
                      aria-describedby="simple-form-name-helper"
                      value={this.state.newNamespaceName}
                      onChange={value =>
                          this.setState({
                              newNamespaceName: value,
                          })
                      }
                    />
                </FormGroup>
                <FormGroup label="Group"
                           helperText="Please provide the groups ids"
                           isRequired fieldId="simple-form-group"
                >
                    <TextInput
                      isRequired
                      type="text"
                      id="newNamespaceGroupIds"
                      name="newNamespaceGroupIds"
                      value={this.state.newNamespaceGroupIds}
                      onChange={value =>
                          this.setState({
                              newNamespaceGroupIds: value,
                          })
                      }
                    />
                </FormGroup>
            </Form>
        </Modal>
    </React.Fragment>

    }
  }
