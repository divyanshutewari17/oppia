// Copyright 2018 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Factory for creating new frontend instances of Learner
 *     Action domain objects.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';

import { StatisticsDomainConstants } from
  'domain/statistics/statistics-domain.constants';

export interface IExplorationStartCustomizationArgs {
  'state_name': {value: string};
}

export interface IAnswerSubmitCustomizationArgs {
  'state_name': {value: string};
  'dest_state_name': {value: string};
  'interaction_id': {value: string};
  'submitted_answer': {value: string};
  'feedback': {value: string};
  'time_spent_state_in_msecs': {value: number};
}

export interface IExplorationQuitCustomizationArgs {
  'state_name': {value: string};
  'time_spent_in_state_in_msecs': {value: number};
}

// NOTE TO DEVELOPERS: Treat this as an implementation detail; do not export it.
// This type takes one of the values of the above customization args based
// on the type of ActionType.
type ActionCustomizationArgs<ActionType> = (
  ActionType extends 'ExplorationStart' ?
  IExplorationStartCustomizationArgs :
  ActionType extends 'AnswerSubmit' ? IAnswerSubmitCustomizationArgs :
  ActionType extends 'ExplorationQuit' ?
  IExplorationQuitCustomizationArgs : never);

// NOTE TO DEVELOPERS: Treat this as an implementation detail; do not export it.
// This interface takes the type of backend dict according to the ActionType
// parameter.
interface ILearnerActionBackendDictBase<ActionType> {
  'action_type': ActionType;
  'action_customization_args': ActionCustomizationArgs<ActionType>;
  'schema_version': number;
}

export type IExplorationStartLearnerActionBackendDict = (
  ILearnerActionBackendDictBase<'ExplorationStart'>);

export type IAnswerSubmitLearnerActionBackendDict = (
  ILearnerActionBackendDictBase<'AnswerSubmit'>);

export type IExplorationQuitLearnerActionBackendDict = (
  ILearnerActionBackendDictBase<'ExplorationQuit'>);

export type ILearnerActionBackendDict = (
  IExplorationStartLearnerActionBackendDict |
  IAnswerSubmitLearnerActionBackendDict |
  IExplorationQuitLearnerActionBackendDict);

// NOTE TO DEVELOPERS: Treat this as an implementation detail; do not export it.
// This class takes the type according to the ActionType parameter.
class LearnerActionBase<ActionType> {
  constructor(
      public readonly actionType: ActionType,
      public actionCustomizationArgs: ActionCustomizationArgs<ActionType>,
      public schemaVersion: number) {
    if (schemaVersion < 1) {
      throw new Error('given invalid schema version');
    }
  }

  toBackendDict(): ILearnerActionBackendDictBase<ActionType> {
    return {
      action_type: this.actionType,
      action_customization_args: this.actionCustomizationArgs,
      schema_version: this.schemaVersion,
    };
  }
}

export class ExplorationStartLearnerAction extends
  LearnerActionBase<'ExplorationStart'> {}

export class AnswerSubmitLearnerAction extends
  LearnerActionBase<'AnswerSubmit'> {}

export class ExplorationQuitLearnerAction extends
  LearnerActionBase<'ExplorationQuit'> {}

export type LearnerAction = (
  ExplorationStartLearnerAction |
  AnswerSubmitLearnerAction |
  ExplorationQuitLearnerAction);

@Injectable({
  providedIn: 'root'
})
export class LearnerActionObjectFactory {
  createNewExplorationStartAction(
      actionCustomizationArgs: IExplorationStartCustomizationArgs,
      schemaVersion?: number): ExplorationStartLearnerAction {
    schemaVersion = schemaVersion ||
      StatisticsDomainConstants.LEARNER_ACTION_SCHEMA_LATEST_VERSION;
    return new ExplorationStartLearnerAction(
      'ExplorationStart', actionCustomizationArgs, schemaVersion);
  }

  createNewAnswerSubmitAction(
      actionCustomizationArgs: IAnswerSubmitCustomizationArgs,
      schemaVersion?: number): AnswerSubmitLearnerAction {
    schemaVersion = schemaVersion ||
    StatisticsDomainConstants.LEARNER_ACTION_SCHEMA_LATEST_VERSION;
    return new AnswerSubmitLearnerAction(
      'AnswerSubmit', actionCustomizationArgs, schemaVersion);
  }

  createNewExplorationQuitAction(
      actionCustomizationArgs: IExplorationQuitCustomizationArgs,
      schemaVersion?: number): ExplorationQuitLearnerAction {
    schemaVersion = schemaVersion ||
    StatisticsDomainConstants.LEARNER_ACTION_SCHEMA_LATEST_VERSION;
    return new ExplorationQuitLearnerAction(
      'ExplorationQuit', actionCustomizationArgs, schemaVersion);
  }

  /**
   * @typedef LearnerActionBackendDict
   * @property {string} actionType - type of an action.
   * @property {Object.<string, *>} actionCustomizationArgs - customization
   *   dict for an action.
   * @property {number} schemaVersion - schema version of the class instance.
   *   Defaults to the latest schema version.
   */

  /**
   * @param {LearnerActionBackendDict} learnerActionBackendDict
   * @returns {LearnerAction}
   */
  createFromBackendDict(
      learnerActionBackendDict: ILearnerActionBackendDict): LearnerAction {
    switch (learnerActionBackendDict.action_type) {
      case 'ExplorationStart':
        return new ExplorationStartLearnerAction(
          learnerActionBackendDict.action_type,
          learnerActionBackendDict.action_customization_args,
          learnerActionBackendDict.schema_version);
      case 'AnswerSubmit':
        return new AnswerSubmitLearnerAction(
          learnerActionBackendDict.action_type,
          learnerActionBackendDict.action_customization_args,
          learnerActionBackendDict.schema_version);
      case 'ExplorationQuit':
        return new ExplorationQuitLearnerAction(
          learnerActionBackendDict.action_type,
          learnerActionBackendDict.action_customization_args,
          learnerActionBackendDict.schema_version);
      default:
        break;
    }
    const invalidBackendDict: never = learnerActionBackendDict;
    throw new Error(
      'Backend dict does not match any known action type: ' +
      angular.toJson(invalidBackendDict));
  }
}

angular.module('oppia').factory(
  'LearnerActionObjectFactory',
  downgradeInjectable(LearnerActionObjectFactory));
