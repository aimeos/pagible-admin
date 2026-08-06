/** @license MIT, https://opensource.org/license/mit */

<script>
import gql from 'graphql-tag'
import { mdiMagnify } from '@mdi/js'
import { apolloClient } from '../graphql'
import { useMessageStore, useUserStore } from '../stores'

const USER_DATA = gql`
  fragment CmsUserDataFields on CmsUserData {
    id
    email
    access @include(if: $withAccess)
    permissions @include(if: $withPermissions)
  }
`

const FETCH_USER = gql`
  ${USER_DATA}
  query ($email: String!, $withAccess: Boolean!, $withPermissions: Boolean!) {
    cmsUser(email: $email) {
      ...CmsUserDataFields
    }
  }
`

const FETCH_PERMISSIONS = gql`
  query {
    permissions {
      roles
      permissions
    }
  }
`

const SET_USER_ACCESS = gql`
  mutation ($id: ID!, $access: [String!]!) {
    assignments: setUserAccess(id: $id, access: $access)
  }
`

const SET_USER_PERMISSIONS = gql`
  mutation ($id: ID!, $permissions: [String!]!) {
    assignments: setUserPermissions(id: $id, permissions: $permissions)
  }
`

const CREATE_USER = gql`
  ${USER_DATA}
  mutation ($email: String!, $withAccess: Boolean!, $withPermissions: Boolean!) {
    createUser(email: $email) {
      ...CmsUserDataFields
    }
  }
`

export default {
  name: 'AccessUsers',

  props: {
    roles: { type: Array, default: () => [] },
    rolesLoading: { type: Boolean, default: false }
  },

  setup() {
    const messages = useMessageStore()
    const user = useUserStore()

    return {
      messages,
      user,
      mdiMagnify
    }
  },

  data() {
    return {
      creating: false,
      email: '',
      loadingPermissions: false,
      loadingUser: false,
      permissionOptions: { roles: [], permissions: [] },
      result: undefined,
      savingAccess: false,
      savingPermissions: false
    }
  },

  computed: {
    accessItems() {
      return [...new Set([...(this.result?.access || []), ...this.roles])].sort()
    },

    canAccess() {
      return this.user.can('user:access')
    },

    canCreate() {
      return this.user.can('user:create')
    },

    canManage() {
      return this.canAccess || this.canPermission
    },

    canPermission() {
      return this.user.can('user:permission')
    },

    emailValid() {
      return (
        this.searchEmail.length <= 255 && /^[^\s@]+@[^\s@]+$/.test(this.searchEmail)
      )
    },

    assignedPermissionRoles() {
      return [...new Set((this.result?.permissions || []).filter((entry) => this.isRole(entry)))]
    },

    permissionGroups() {
      const permissions = new Set([...this.permissionOptions.permissions, ...(this.result?.permissions || [])])
      const groups = {}

      for (const permission of permissions) {
        if (typeof permission !== 'string') continue

        const normalized = permission.startsWith('!') ? permission.substring(1) : permission
        if (!normalized.includes(':')) continue

        const [prefix] = normalized.split(':', 2)
        if (!prefix) continue

        if (!groups[prefix]) {
          groups[prefix] = new Set()
        }

        groups[prefix].add(permission)
      }

      return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([prefix, entries]) => ({
          prefix,
          permissions: [...entries].sort()
        }))
    },

    permissionRoleItems() {
      return [...new Set([...this.permissionOptions.roles, ...this.assignedPermissionRoles])].sort()
    },

    permissionRole() {
      return this.assignedPermissionRoles.length === 1 ? this.assignedPermissionRoles[0] : null
    },

    permissionValues() {
      return new Set(this.result?.permissions || [])
    },

    searchEmail() {
      return this.email?.trim().toLocaleLowerCase() || ''
    }
  },

  mounted() {
    if (this.canPermission) this.loadPermissions()
  },

  methods: {
    async change(field, values, mutation) {
      const saving = field === 'access' ? 'savingAccess' : 'savingPermissions'
      if (!this.result || this[saving]) return

      const email = this.result.email
      const id = this.result.id
      const current = new Set(this.result[field] || [])
      const assignments = [...new Set(Array.isArray(values) ? values : [])]

      if (
        assignments.length === current.size &&
        assignments.every((value) => current.has(value))
      ) {
        return
      }

      this[saving] = true

      try {
        const response = await apolloClient.mutate({
          mutation,
          variables: { id, [field]: assignments }
        })

        if (email === this.searchEmail) {
          this.result = { ...this.result, [field]: response.data.assignments }

          if (field === 'access') {
            this.messages.add(this.$gettext('Access roles updated'), 'success')
          }
        }
      } catch (error) {
        if (email === this.searchEmail) {
          const message =
            field === 'access'
              ? this.$gettext('Error updating access roles')
              : this.$gettext('Error updating CMS permissions')

          this.messages.add(message + ':\n' + error, 'error')
        }
      } finally {
        this[saving] = false
      }
    },

    changeAccess(values) {
      return this.change('access', values, SET_USER_ACCESS)
    },

    changePermissions(values) {
      return this.change('permissions', values, SET_USER_PERMISSIONS)
    },

    changePermissionRole(role) {
      if (!this.result || this.savingPermissions) return

      const assignments = new Set((this.result.permissions || []).filter((entry) => !this.isRole(entry)))

      if (role) assignments.add(role)

      this.changePermissions([...assignments])
    },

    isPermissionAssigned(permission) {
      return this.permissionValues.has(permission)
    },

    isRole(entry) {
      return typeof entry === 'string' && !entry.startsWith('!') && !entry.includes(':')
    },

    async createUser() {
      const email = this.searchEmail
      if (!this.canCreate || !this.emailValid || this.creating || this.loadingUser) return

      this.creating = true

      try {
        const response = await apolloClient.mutate({
          mutation: CREATE_USER,
          variables: {
            email,
            withAccess: this.canAccess,
            withPermissions: this.canPermission
          }
        })

        if (email === this.searchEmail) {
          this.messages.add(this.$gettext('User created'), 'success')
          this.result = response.data.createUser
        }
      } catch (error) {
        if (email === this.searchEmail) {
          this.messages.add(this.$gettext('Error creating user') + ':\n' + error, 'error')
        }
      } finally {
        this.creating = false
      }
    },

    emailChanged() {
      this.result = undefined
    },

    async loadPermissions() {
      if (this.loadingPermissions) return

      this.loadingPermissions = true

      try {
        const response = await apolloClient.query({
          query: FETCH_PERMISSIONS,
          fetchPolicy: 'network-only'
        })

        this.permissionOptions = response.data.permissions
      } catch (error) {
        this.messages.add(this.$gettext('Error fetching access roles') + ':\n' + error, 'error')
      } finally {
        this.loadingPermissions = false
      }
    },

    async search() {
      const email = this.searchEmail
      if (!this.canManage || !this.emailValid || this.loadingUser || this.creating) return

      this.loadingUser = true
      this.result = undefined

      try {
        const response = await apolloClient.query({
          query: FETCH_USER,
          variables: {
            email,
            withAccess: this.canAccess,
            withPermissions: this.canPermission
          },
          fetchPolicy: 'no-cache'
        })

        if (email === this.searchEmail) {
          this.result = response.data.cmsUser
        }
      } catch (error) {
        if (email === this.searchEmail) {
          this.messages.add(this.$gettext('Error fetching user access roles') + ':\n' + error, 'error')
        }
      } finally {
        this.loadingUser = false
      }
    },

    togglePermission(permission, active) {
      if (!this.result || this.savingPermissions) return

      const assignments = new Set(this.result.permissions || [])

      if (active === false) {
        assignments.delete(permission)
      } else if (active === true) {
        assignments.add(permission)
      } else if (assignments.has(permission)) {
        assignments.delete(permission)
      } else {
        assignments.add(permission)
      }

      this.changePermissions([...assignments])
    }
  }
}
</script>

<template>
  <div class="access-users">
    <v-form class="user-search" @submit.prevent="search()">
      <v-text-field
        v-model="email"
        type="email"
        :prepend-inner-icon="mdiMagnify"
        variant="underlined"
        :label="$gettext('Email address')"
        maxlength="255"
        hide-details
        clearable
        @update:model-value="emailChanged"
      />
      <v-btn
        v-if="canManage"
        type="submit"
        color="primary"
        variant="tonal"
        :disabled="loadingUser || creating || !emailValid"
        :loading="loadingUser"
      >
        {{ $gettext('Search') }}
      </v-btn>
      <v-btn
        v-if="canCreate"
        type="button"
        class="btn-create"
        color="primary"
        variant="tonal"
        :disabled="creating || loadingUser || !emailValid"
        :loading="creating"
        @click="createUser"
      >
        {{ $gettext('Create user') }}
      </v-btn>
    </v-form>

    <v-progress-linear v-if="loadingUser" indeterminate color="primary" />

    <div v-else-if="result" class="user-table">
      <p class="found-email">{{ result.email }}</p>

      <section v-if="canAccess" class="assignment">
        <h3 class="assignment-title">{{ $gettext('Assigned roles') }}</h3>
        <v-autocomplete
          class="assigned assigned-access"
          :model-value="result.access"
          :items="accessItems"
          :loading="rolesLoading || savingAccess"
          :disabled="savingAccess"
          :label="$gettext('Assigned roles')"
          variant="underlined"
          multiple
          chips
          closable-chips
          clearable
          hide-selected
          hide-details
          @update:model-value="changeAccess"
        />
      </section>

      <section v-if="canPermission" class="assignment assigned-permissions">
        <h3 class="assignment-title">{{ $gettext('Assigned permissions') }}</h3>

        <v-select
          class="assigned"
          :model-value="permissionRole"
          :items="permissionRoleItems"
          :loading="loadingPermissions || savingPermissions"
          :disabled="loadingPermissions || savingPermissions"
          :label="$gettext('Available roles')"
          variant="underlined"
          clearable
          hide-details
          @update:model-value="changePermissionRole"
        />

        <div class="permissions">
          <div v-for="group in permissionGroups" :key="group.prefix" class="permission-group">
            <h4 class="permission-prefix">{{ group.prefix }}</h4>
            <div class="permission-options">
              <div
                v-for="permission in group.permissions"
                :key="permission"
                class="permission-option"
              >
                <v-checkbox-btn
                  :model-value="isPermissionAssigned(permission)"
                  :label="permission"
                  :disabled="loadingPermissions || savingPermissions"
                  :aria-label="permission"
                  hide-details
                  @update:model-value="(value) => togglePermission(permission, value)"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <p v-else-if="result === null" class="notfound">{{ $gettext('No entries found') }}</p>

    <p v-if="result && canAccess" class="hint">
      {{
        $gettext(
          'Removing a direct role may not remove access granted through provider roles or other integrations.'
        )
      }}
    </p>
  </div>
</template>

<style scoped>
.user-search {
  align-items: end;
  display: flex;
  gap: 16px;
  padding: 16px;
}

.user-search .v-text-field {
  max-width: 30rem;
}

.user-table {
  padding: 0 16px 16px;
}

.found-email {
  font-family: monospace;
  font-size: 18px;
  margin: 0 0 16px;
  word-break: break-word;
}

.assignment {
  margin-bottom: 24px;
}

.assignment-title {
  margin: 0 0 8px;
}

.permission-prefix {
  margin: 0 0 8px;
  font-family: monospace;
}

.assigned :deep(.v-chip),
.permission-prefix,
.found-email {
  font-family: monospace;
}

.assigned {
  min-width: 20rem;
}

.permissions {
  display: grid;
  gap: 16px;
  margin-top: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.permission-group {
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 6px;
  padding: 12px;
}

.permission-options {
  display: grid;
  gap: 2px;
}

.permission-option {
  align-items: center;
  display: flex;
}

.permission-option :deep(.v-selection-control) {
  width: fit-content;
}

.permission-option :deep(.v-label) {
  margin-inline-start: 8px;
}

.hint {
  color: rgb(var(--v-theme-on-surface-light));
  margin: 0;
  padding: 0 16px 16px;
}

.notfound {
  margin: 0;
  padding: 16px;
}

@media (max-width: 600px) {
  .user-search {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
